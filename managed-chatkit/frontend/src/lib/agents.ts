export type AgentId = "chatgpt" | "custom";

export interface AgentDefinition {
  id: AgentId;
  name: string;
  description: string;
  icon: string;
}

export const agents: AgentDefinition[] = [
  {
    id: "chatgpt",
    name: "ChatGPT (Workflow)",
    description: "Usa el workflow configurado en ChatKit.",
    icon: "🤖",
  },
  {
    id: "custom",
    name: "Agente n8n",
    description: "Conecta contra el webhook n8n personalizado.",
    icon: "🛠️",
  },
];
