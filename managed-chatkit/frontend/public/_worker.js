// Cloudflare Worker for ChatKit Session API
const CHATKIT_API_BASE = "https://api.openai.com";
const SESSION_COOKIE_NAME = "chatkit_session_id";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const DEFAULT_WORKFLOW_ID = "wf_696633c3eb508190b76d628393caed260d34f6b352dec799";

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle API routes
        if (url.pathname === "/api/create-session" && request.method === "POST") {
            return handleCreateSession(request, env);
        }

        if (url.pathname === "/health") {
            return new Response(JSON.stringify({ status: "ok" }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // For all other requests, return null to let assets handle it
        return env.ASSETS.fetch(request);
    },
};

async function handleCreateSession(request, env) {
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
        return jsonResponse({ error: "Missing OPENAI_API_KEY" }, 500);
    }

    let body = {};
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    const workflowId = resolveWorkflowId(body, env);
    if (!workflowId) {
        return jsonResponse({ error: "Missing workflow id" }, 400);
    }

    const { userId, cookieValue } = resolveUser(request);

    try {
        const upstream = await fetch(`${CHATKIT_API_BASE}/v1/chatkit/sessions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "OpenAI-Beta": "chatkit_beta=v1",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                workflow: { id: workflowId },
                user: userId,
            }),
        });

        let payload = {};
        try {
            payload = await upstream.json();
        } catch {
            payload = {};
        }

        if (!upstream.ok) {
            const message = payload.error || "Failed to create session";
            return jsonResponse({ error: message }, upstream.status, cookieValue);
        }

        if (!payload.client_secret) {
            return jsonResponse(
                { error: "Missing client secret in response" },
                502,
                cookieValue
            );
        }

        return jsonResponse(
            {
                client_secret: payload.client_secret,
                expires_after: payload.expires_after,
            },
            200,
            cookieValue
        );
    } catch (error) {
        return jsonResponse(
            { error: `Failed to reach ChatKit API: ${error.message}` },
            502,
            cookieValue
        );
    }
}

function resolveWorkflowId(body, env) {
    let workflowId = null;

    if (body.workflow && typeof body.workflow === "object") {
        workflowId = body.workflow.id;
    }
    workflowId = workflowId || body.workflowId;

    const envWorkflow =
        env.CHATKIT_WORKFLOW_ID || env.VITE_CHATKIT_WORKFLOW_ID || DEFAULT_WORKFLOW_ID;

    if (!workflowId && envWorkflow) {
        workflowId = envWorkflow;
    }

    return workflowId && typeof workflowId === "string" && workflowId.trim()
        ? workflowId.trim()
        : null;
}

function resolveUser(request) {
    const cookies = parseCookies(request.headers.get("Cookie") || "");
    const existing = cookies[SESSION_COOKIE_NAME];

    if (existing) {
        return { userId: existing, cookieValue: null };
    }

    const userId = crypto.randomUUID();
    return { userId, cookieValue: userId };
}

function parseCookies(cookieHeader) {
    const cookies = {};
    cookieHeader.split(";").forEach((cookie) => {
        const [name, ...rest] = cookie.split("=");
        if (name) {
            cookies[name.trim()] = rest.join("=").trim();
        }
    });
    return cookies;
}

function jsonResponse(data, status, cookieValue = null) {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (cookieValue) {
        headers[
            "Set-Cookie"
        ] = `${SESSION_COOKIE_NAME}=${cookieValue}; Max-Age=${SESSION_COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax; Secure; Path=/`;
    }

    return new Response(JSON.stringify(data), { status, headers });
}
