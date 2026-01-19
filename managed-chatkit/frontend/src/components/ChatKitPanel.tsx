import { useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "../lib/chatkitSession";

interface ChatKitPanelProps {
  apiKey?: string;
  workflowId: string;
  chatkitConfiguration?: any;
}

export function ChatKitPanel({ apiKey, workflowId, chatkitConfiguration }: ChatKitPanelProps) {
  const getClientSecret = useMemo(
    () => createClientSecretFetcher(workflowId, "/api/chatkit/session", apiKey, chatkitConfiguration),
    [apiKey, workflowId, chatkitConfiguration]
  );

  const fileUploadEnabled = !!chatkitConfiguration?.file_upload?.enabled;

  const chatkit = useChatKit({
    api: { getClientSecret },
    ...(fileUploadEnabled && {
      composer: {
        attachments: {
          enabled: true,
        }
      }
    })
  });

  return (
    <div className="h-full w-full bg-white">
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}

