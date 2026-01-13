import { useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "../lib/chatkitSession";

interface ChatKitPanelProps {
  apiKey?: string;
}

export function ChatKitPanel({ apiKey }: ChatKitPanelProps) {
  const getClientSecret = useMemo(
    () => createClientSecretFetcher(workflowId, "/api/create-session", apiKey),
    [apiKey]
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
  });

  return (
    <div className="h-full w-full bg-white">
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}

