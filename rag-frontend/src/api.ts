// src/api.ts
// Full file: handles all backend calls and returns parsed JSON safely.

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

// --------------------
// Types that match your FastAPI responses
// --------------------
export type ThreadListResponse = {
  threads: string[];
};

export type CreateThreadResponse = {
  thread_id: string;
};

export async function getMessages(threadId: string) {
  return requestJSON<{ thread_id: string; messages: ChatMessage[] }>(
    `/threads/${encodeURIComponent(threadId)}/messages`
  );
}


export type MetadataResponse = {
  thread_id: string;
  has_document: boolean;
  metadata: Record<string, any>;
};

export type ChatMessage = {
  type: string;          // "human", "ai", "tool", "system" etc.
  content: any;          // usually a string, sometimes structured
  name?: string;         // tool name if it is a tool message
};

export type ChatResponse = {
  thread_id: string;
  assistant: string;
  messages: ChatMessage[];  // ✅ this is the full history
};

// --------------------
// Helper: throw useful errors
// --------------------
async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") return data.detail;
    return JSON.stringify(data);
  } catch {
    try {
      return await res.text();
    } catch {
      return `HTTP ${res.status}`;
    }
  }
}

async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const msg = await readError(res);
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

// --------------------
// API functions
// --------------------
export async function listThreads(): Promise<ThreadListResponse> {
  return requestJSON<ThreadListResponse>("/threads");
}

export async function createThread(): Promise<CreateThreadResponse> {
  return requestJSON<CreateThreadResponse>("/threads", {
    method: "POST",
  });
}

export async function getMetadata(threadId: string): Promise<MetadataResponse> {
  return requestJSON<MetadataResponse>(`/threads/${encodeURIComponent(threadId)}/metadata`);
}

export async function uploadPdf(threadId: string, file: File): Promise<any> {
  const form = new FormData();
  form.append("file", file);

  return requestJSON<any>(`/threads/${encodeURIComponent(threadId)}/pdf`, {
    method: "POST",
    body: form,
  });
}

export async function sendChat(threadId: string, message: string): Promise<ChatResponse> {
  return requestJSON<ChatResponse>(`/threads/${encodeURIComponent(threadId)}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}
