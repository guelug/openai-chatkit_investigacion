import { useEffect, useState } from "react";
import { User } from "../types";

declare global {
  interface Window {
    google: any;
  }
}

interface LoginProps {
  onLogin: (user: User) => void;
}

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const ALLOWED_DOMAINS = ["funiber.org", "uneatlantico.es"];
const DEFAULT_CLIENT_ID =
  "519816706964-en25d9nk3vfarphvmduf96eupmpp4hfv.apps.googleusercontent.com";

export function Login({ onLogin }: LoginProps) {
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>(DEFAULT_CLIENT_ID);
  const [showClientIdInput, setShowClientIdInput] = useState(false);

  useEffect(() => {
    const cleanId = clientId.trim();
    if (!cleanId) return;

    const initialize = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: cleanId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: false,
          });

          const buttonDiv = document.getElementById("googleButtonDiv");
          if (buttonDiv) {
            buttonDiv.innerHTML = "";
            window.google.accounts.id.renderButton(buttonDiv, {
              theme: "outline",
              size: "large",
              width: "280",
              shape: "rectangular",
            });
          }
        } catch (e) {
          console.error("Google Auth Initialization Error:", e);
          setError("Error inicializando Google Auth.");
        }
      }
    };

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        initialize();
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [clientId]);

  const handleCredentialResponse = (response: any) => {
    const payload = parseJwt(response.credential);
    if (!payload) {
      setError("Error procesando las credenciales de Google.");
      return;
    }
    const email: string = payload.email;
    const domain = email.split("@")[1];
    const isAllowed = ALLOWED_DOMAINS.some((d) => email.endsWith(`@${d}`));

    if (!isAllowed) {
      setError(`El dominio ${domain} no está autorizado.`);
      return;
    }

    onLogin({
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-sky-600 p-4 rounded-2xl shadow-lg">
            <span className="text-white text-xl font-bold">AI</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Acceso Institucional
        </h1>
        <p className="text-slate-500 mb-8">
          Ingresa con tu cuenta institucional para continuar.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 text-left">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-6 min-h-[44px]">
          <div id="googleButtonDiv"></div>
        </div>

        {showClientIdInput ? (
          <div className="mt-4 pt-4 border-t border-slate-100 text-left">
            <label className="text-xs text-slate-400">
              Configuración Manual (Client ID)
            </label>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Ingresa Google Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <button
              onClick={() => setShowClientIdInput(true)}
              className="text-[10px] text-slate-400 hover:text-sky-600 underline"
            >
              ¿Problemas? Configurar Client ID
            </button>
          </div>
        )}

        <div className="mt-8 text-xs text-slate-400 flex flex-col gap-1">
          <span>Dominios autorizados:</span>
          <div className="flex gap-2 justify-center font-mono">
            {ALLOWED_DOMAINS.map((d) => (
              <span key={d} className="bg-slate-100 px-2 py-1 rounded">
                @{d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
