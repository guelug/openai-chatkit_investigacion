export type AgentId = "general-chat" | "chatgpt-basic" | "chatgpt-pro" | "custom";

export interface AgentDefinition {
  id: AgentId;
  name: string;
  description: string;
  icon: string;
  workflowId?: string;
  chatkitConfiguration?: {
    file_upload?: {
      enabled: boolean;
    };
  };
}

export const agents: AgentDefinition[] = [
  {
    id: "general-chat",
    name: "General chat",
    description: "Agente de chat general con soporte de archivos.",
    icon: "💬",
    workflowId: "wf_696dfd2a2e088190a4c5e17ecdec986e02f7a6e2ecbfe834",
    chatkitConfiguration: {
      file_upload: {
        enabled: true
      }
    }
  },
  {
    id: "chatgpt-basic",
    name: "ChatGPT Research Basic",
    description: "Agente básico de investigación.",
    icon: "🤖",
    workflowId: "wf_696633c3eb508190b76d628393caed260d34f6b352dec799",
    chatkitConfiguration: {
      file_upload: {
        enabled: true
      }
    }
  },
  {
    id: "chatgpt-pro",
    name: "ChatGPT Research Pro",
    description: "Agente avanzado de investigación.",
    icon: "🧠",
    workflowId: "wf_6966f97a0c208190bc4110d4f97ce34d09bce8f013ae494f",
    chatkitConfiguration: {
      file_upload: {
        enabled: true
      }
    }
  },
  {
    id: "custom",
    name: "Agente n8n",
    description: "Conecta contra el webhook n8n personalizado.",
    icon: "🛠️",
  },
];

