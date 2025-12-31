import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./components/GlassCard";
import { AuroraEdges } from "./components/AuroraEdges";
import { createThread, getMetadata, listThreads, sendChat, uploadPdf, getMessages } from "./api";

type ChatBubble = { role: "user" | "assistant"; text: string };

/** What your backend returns inside `messages` */
type ApiMessage = { type: string; content: any; name?: string };

function prettyThreadLabel(id: string) {
  return id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

/** Convert LangChain message.content (can be string or structured) into display text */
function contentToText(content: any): string {
  if (typeof content === "string") return content;

  // Some message contents can be arrays (multi-part)
  if (Array.isArray(content)) {
    return content
      .map((p) => {
        if (typeof p === "string") return p;
        // common shapes: { text: "..." } or { type: "text", text: "..." }
        if (p && typeof p === "object") return p.text ?? "";
        return "";
      })
      .join("")
      .trim();
  }

  if (content == null) return "";
  return String(content);
}

/** Convert backend `messages` -> UI bubbles */
function messagesToBubbles(msgs: ApiMessage[]): ChatBubble[] {
  const out: ChatBubble[] = [];

  for (const m of msgs || []) {
    const text = contentToText(m.content);
    if (!text) continue;

    if (m.type === "human") out.push({ role: "user", text });
    else if (m.type === "ai") out.push({ role: "assistant", text });

    // We intentionally ignore "system", "tool" messages for UI simplicity.
    // If you want to show them later, we can add a third role type.
  }

  return out;
}

export default function App() {
  const [threads, setThreads] = useState<string[]>([]);
  const [activeThread, setActiveThread] = useState<string>("");
  const [meta, setMeta] = useState<any>(null);

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatBubble[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string>("");

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const title = useMemo(
    () => (activeThread ? `Thread: ${prettyThreadLabel(activeThread)}` : "Select or create a thread"),
    [activeThread]
  );

  async function refreshThreads() {
    const t = await listThreads();
    setThreads(t.threads || []);
  }

  async function loadMetadata(threadId: string) {
    const m = await getMetadata(threadId);
    setMeta(m);
  }

  async function selectThread(id: string) {
  setActiveThread(id);
  setMeta(null);

  await loadMetadata(id);

  const h = await getMessages(id);
  setChat(messagesToBubbles(h.messages || []));
  }


  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function onNewThread() {
    setBusy(true);
    try {
      const t = await createThread();
      await refreshThreads();
      await selectThread(t.thread_id);
      showToast("New thread created");
    } catch (e: any) {
      showToast(e?.message || "Failed to create thread (API not reachable?)");
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(file: File) {
    if (!activeThread) return;
    setBusy(true);
    try {
      await uploadPdf(activeThread, file);
      await loadMetadata(activeThread);
      showToast("PDF indexed for this thread");
    } catch (e: any) {
      showToast(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  /** ✅ Updated: uses r.messages to show full history */
  async function onSend() {
    if (!activeThread) {
      showToast("Create/select a thread first");
      return;
    }

    const text = message.trim();
    if (!text) return;

    setMessage("");
    setBusy(true);

    try {
      const r = await sendChat(activeThread, text);

      // Rebuild chat UI from backend history
      const bubbles = messagesToBubbles(r.messages || []);
      setChat(bubbles);
    } catch (e: any) {
      setChat((c) => [...c, { role: "assistant", text: "Sorry — the server returned an error." }]);
      showToast(e?.message || "Chat failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refreshThreads();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div className="aurora-stage min-h-screen p-6">
      {/* Aurora edges behind everything */}
      <AuroraEdges />

      {/* Top bar above aurora */}
      <div className="mx-auto max-w-6xl mb-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
            <img src="/179436989.png" alt="Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-base font-semibold tracking-wide titanium-text">RAG Chat</div>
            <div className="text-xs text-white/50">Your Assistant on the fly</div>
          </div>
        </div>

        <div className="text-xs text-white/50">
          API:{" "}
          <span className="text-white/70">
            {import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001"}
          </span>
        </div>
      </div>

      {/* Main grid above aurora */}
      <div className="mx-auto max-w-6xl grid grid-cols-12 gap-6 relative z-10">
        {/* Left: Threads */}
        <GlassCard className="col-span-12 md:col-span-3 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm tracking-wide text-white/70">Conversations</div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              className="btn-titanium btn-titanium-sm"
              onClick={onNewThread}
              disabled={busy}
            >
              New
            </motion.button>
          </div>

          <div className="mt-4 space-y-2 max-h-[70vh] overflow-auto pr-1">
            {threads.length === 0 && <div className="text-white/40 text-sm">No threads yet</div>}

            {threads.map((t) => (
              <button
                key={t}
                onClick={() => selectThread(t)}
                className={
                  "w-full text-left rounded-xl px-3 py-2 border transition " +
                  (t === activeThread
                    ? "bg-white/10 border-white/15"
                    : "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10")
                }
              >
                <div className="text-sm text-white/90">{prettyThreadLabel(t)}</div>
                <div className="text-xs text-white/45 break-all">{t}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/45">
            Tip: each thread has its own PDF index.
          </div>
        </GlassCard>

        {/* Center: Chat */}
        <GlassCard className="col-span-12 md:col-span-6 p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">{title}</div>
            <div className="text-xs text-white/40">{busy ? "Working…" : "Ready"}</div>
          </div>

          <div className="mt-4 flex-1 overflow-auto space-y-3 pr-1">
            {chat.length === 0 && (
              <div className="text-white/45 text-sm leading-relaxed">
                1) Create/select a thread. <br />
                2) Upload a PDF (optional). <br />
                3) Ask questions. If your question relates to the PDF, the backend will use RAG automatically.
              </div>
            )}

            {chat.map((b, i) => (
              <div key={i} className={"flex " + (b.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed border " +
                    (b.role === "user"
                      ? "user-bubble"
                      : "bg-white/5 text-white/90 border-white/10")
                  }
                >
                  {b.text}
                </div>
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={activeThread ? "Ask something…" : "Create/select a thread first"}
              className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/20"
              disabled={!activeThread || busy}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSend();
              }}
            />

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              className="btn-titanium btn-titanium-md"
              onClick={onSend}
              disabled={!activeThread || busy}
            >
              Send
            </motion.button>
          </div>

          <div className="mt-2 text-xs text-white/40">
            If your backend throws a CORS error, you must allow this frontend origin in FastAPI.
          </div>
        </GlassCard>

        {/* Right: PDF + Metadata */}
        <GlassCard className="col-span-12 md:col-span-3 p-4">
          <div className="text-sm text-white/70">Document</div>

          <div className="mt-3">
            <label
              className={
                "block rounded-2xl border border-white/10 bg-white/5 p-4 text-sm cursor-pointer " +
                "hover:bg-white/7 transition " +
                (!activeThread || busy ? "opacity-60 cursor-not-allowed" : "")
              }
            >
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={!activeThread || busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                  e.currentTarget.value = "";
                }}
              />
              <div className="text-white/90">Upload PDF</div>
              <div className="text-xs text-white/50 mt-1">Stored per thread (in memory on backend)</div>
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-white/50">Metadata</div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              className="btn-titanium btn-titanium-xs"
              disabled={!activeThread || busy}
              onClick={() => activeThread && loadMetadata(activeThread)}
            >
              Refresh
            </motion.button>
          </div>

          <div className="mt-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/80 max-h-[55vh] overflow-auto">
            {!activeThread && <div className="text-white/40">Select a thread</div>}
            {activeThread && !meta && <div className="text-white/40">Loading…</div>}
            {meta && <pre className="whitespace-pre-wrap break-words">{JSON.stringify(meta, null, 2)}</pre>}
          </div>
        </GlassCard>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 relative z-10">
          <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl px-4 py-2 text-sm text-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
