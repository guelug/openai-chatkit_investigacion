import { useEffect, useRef } from "react";

const N8N_WEBHOOK_URL =
  "https://n8n.mkt.fbr.group/webhook/aee36feb-ba13-4a0e-bb62-798d554f833f/chat";

type N8NChatInstance = { destroy?: () => void } | null;

export function N8NAgentPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<N8NChatInstance>(null);

  useEffect(() => {
    let cancelled = false;

    const loadChat = async () => {
      if (!containerRef.current || cancelled) return;
      if (chatInstanceRef.current) return;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { createChat } = (await import(
          "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js"
        )) as any;

        if (cancelled || !containerRef.current || !createChat) return;

        chatInstanceRef.current = createChat({
          webhookUrl: N8N_WEBHOOK_URL,
          target: containerRef.current,
          mode: "fullscreen",
          showWelcomeScreen: false,
          initialMessages: [
            "Hola, soy tu agente personalizado conectado a n8n. ¿En qué te ayudo?",
          ],
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
      } catch (error) {
        console.error("[N8NAgentPanel] Failed to load n8n chat", error);
      }
    };

    loadChat();

    return () => {
      cancelled = true;
      if (chatInstanceRef.current?.destroy) {
        chatInstanceRef.current.destroy();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      chatInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="h-full w-full bg-white">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
