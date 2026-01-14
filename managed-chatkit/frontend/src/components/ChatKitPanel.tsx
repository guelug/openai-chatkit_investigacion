import { useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "../lib/chatkitSession";

interface ChatKitPanelProps {
  apiKey?: string;
  workflowId: string;
}

export function ChatKitPanel({ apiKey, workflowId }: ChatKitPanelProps) {
  const getClientSecret = useMemo(
    () => createClientSecretFetcher(workflowId, "/api/chatkit/session", apiKey),
    [apiKey, workflowId]
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

