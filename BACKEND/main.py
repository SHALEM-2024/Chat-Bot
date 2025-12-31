import uuid
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_core.messages import BaseMessage, HumanMessage

from langgraph_rag_backend import CURRENT_THREAD_ID


# Import from your existing module
from langgraph_rag_backend import (
    ingest_pdf,
    chatbot,
    retrieve_all_threads,
    thread_document_metadata,
    thread_has_document,
)

app = FastAPI(title="LangGraph RAG API", version="1.0")

# If you have a frontend on a different port/domain, CORS is needed.
# CORS = Cross-Origin Resource Sharing (browser security rule).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in production: set your frontend domain(s) only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Request/Response Schemas
# -------------------------
class CreateThreadResponse(BaseModel):
    thread_id: str


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    thread_id: str
    assistant: str
    messages: List[Dict[str, Any]]


class MetadataResponse(BaseModel):
    thread_id: str
    has_document: bool
    metadata: Dict[str, Any]


# -------------------------
# Helpers
# -------------------------
def new_thread_id() -> str:
    return str(uuid.uuid4())


def serialize_message(m: BaseMessage) -> Dict[str, Any]:
    # BaseMessage has "type" and "content". Some messages (tool) may have "name".
    data = {
        "type": getattr(m, "type", m.__class__.__name__),
        "content": getattr(m, "content", ""),
    }
    name = getattr(m, "name", None)
    if name:
        data["name"] = name
    return data


# -------------------------
# Endpoints
# -------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/threads", response_model=CreateThreadResponse)
def create_thread():
    """
    Create a new conversation thread_id.
    Thread ID is like a conversation session key.
    """
    return CreateThreadResponse(thread_id=new_thread_id())


@app.get("/threads")
def list_threads():
    """
    List all thread_ids found in SQLite checkpoints.
    """
    return {"threads": retrieve_all_threads()}


@app.get("/threads/{thread_id}/metadata", response_model=MetadataResponse)
def get_thread_metadata(thread_id: str):
    return MetadataResponse(
        thread_id=thread_id,
        has_document=thread_has_document(thread_id),
        metadata=thread_document_metadata(thread_id),
    )


@app.post("/threads/{thread_id}/pdf")
async def upload_pdf(thread_id: str, file: UploadFile = File(...)):
    """
    Upload + index a PDF for this thread.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a .pdf file")

    file_bytes = await file.read()
    try:
        summary = ingest_pdf(file_bytes=file_bytes, thread_id=thread_id, filename=file.filename)
        return {"thread_id": thread_id, "indexed": True, "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/threads/{thread_id}/chat", response_model=ChatResponse)
def chat(thread_id: str, req: ChatRequest):
    try:
        config = {"configurable": {"thread_id": thread_id}}

        token = CURRENT_THREAD_ID.set(thread_id)  # ✅ set for this request
        try:
            final_state = chatbot.invoke(
                {"messages": [HumanMessage(content=req.message)]},
                config=config,
            )
        finally:
            CURRENT_THREAD_ID.reset(token)  # ✅ cleanup

        msgs: List[BaseMessage] = final_state.get("messages", [])
        serialized = [serialize_message(m) for m in msgs]

        assistant_text = ""
        for m in reversed(msgs):
            if getattr(m, "type", "") == "ai":
                assistant_text = getattr(m, "content", "")
                break

        return ChatResponse(
            thread_id=thread_id,
            assistant=assistant_text,
            messages=serialized,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/threads/{thread_id}/messages")
def get_thread_messages(thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    state = chatbot.get_state(config=config)   # reads from sqlite checkpointer
    msgs = state.values.get("messages", [])
    return {"thread_id": thread_id, "messages": [serialize_message(m) for m in msgs]}
