const readEnvString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;

export const workflowId = (() => {
  const fallbackWorkflowId =
    "wf_696633c3eb508190b76d628393caed260d34f6b352dec799";
  const id = readEnvString(env?.VITE_CHATKIT_WORKFLOW_ID);
  if (id && !id.startsWith("wf_replace")) {
    return id;
  }
  return fallbackWorkflowId;
})();

export function createClientSecretFetcher(
  workflow: string,
  endpoint = "/api/chatkit/session",
  apiKey?: string,
  chatkitConfiguration?: any
) {
  return async (currentSecret: string | null) => {
    // If the SDK passes a secret, it means it's expired or invalid. 
    // We must fetch a NEW one, not return the old one.
    // if (currentSecret) return currentSecret; <--- REMOVED CAUSE OF INFINITE LOOP


    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }

    const body: any = { workflow: { id: workflow } };
    if (chatkitConfiguration) {
      body.chatkit_configuration = chatkitConfiguration;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      client_secret?: string;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to create session");
    }

    if (!payload.client_secret) {
      throw new Error("Missing client secret in response");
    }

    return payload.client_secret;
  };
}

