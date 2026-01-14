import { useCallback, useEffect, useRef, useState } from "react";

const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL ||
  "https://n8n.mkt.fbr.group/webhook/aee36feb-ba13-4a0e-bb62-798d554f833f/chat";

type ChatMessage = { id: string; role: "user" | "assistant" | "system"; text: string };
type N8NChatInstance = { destroy?: () => void } | null;

/**
 * Legacy widget loader (no se usa por defecto, pero se mantiene para referencia).
 * Dejarlo aquí evita eliminar lógica previa y sirve como fallback.
 */
async function loadLegacyWidget(target: HTMLDivElement, instanceRef: React.MutableRefObject<N8NChatInstance>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { createChat } = (await import("https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js")) as any;
  if (!createChat) return;
  instanceRef.current = createChat({
    webhookUrl: N8N_WEBHOOK_URL,
    target,
    mode: "fullscreen",
    showWelcomeScreen: false,
    initialMessages: ["Hola, soy tu agente personalizado conectado a n8n. ¿En qué te ayudo?"],
    defaultLanguage: "es",
    i18n: {
      es: {
        title: "",
        subtitle: "",
        getStarted: "",
        inputPlaceholder: "Escribe tu consulta...",
        footer: "",
      },
    },
    loadPreviousSession: false,
  });
}

export function N8NAgentPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hola, soy tu agente conectado a n8n. ¿En qué te ayudo?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<N8NChatInstance>(null);

  useEffect(() => {
    return () => {
      if (chatInstanceRef.current?.destroy) {
        chatInstanceRef.current.destroy();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      chatInstanceRef.current = null;
    };
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setError(null);
    setLoading(true);

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
      }

      let botText = "";
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (Array.isArray(data)) {
          botText =
            data
              .map((item) => item?.text || item?.message || item?.content || "")
              .filter(Boolean)
              .join("\n") || "";
        } else if (data && typeof data === "object") {
          botText = data.text || data.message || data.content || "";
        }
      } else {
        botText = (await response.text()) || "";
      }

      if (!botText.trim()) {
        botText = "No recibí respuesta del agente n8n.";
      }

      const botMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", text: botText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("[N8NAgentPanel] Error enviando mensaje a n8n", err);
      setError("No se pudo obtener respuesta del agente n8n.");
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === "assistant"
                    ? "bg-white border border-slate-200 text-slate-900"
                    : "bg-emerald-600 text-white"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta..."
              className="w-full resize-none bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
              rows={3}
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setMessages((prev) => prev.slice(0, 1))}
                className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 transition"
              >
                Limpiar
              </button>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  loading || !input.trim()
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                Enviar
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Conectado a n8n: {N8N_WEBHOOK_URL.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </div>
    </div>
  );
}
