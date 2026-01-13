import React, { useEffect, useState } from "react";
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

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>(DEFAULT_CLIENT_ID);
  const [showClientIdInput, setShowClientIdInput] = useState(false);

  useEffect(() => {
    const cleanId = clientId.trim();
    if (!cleanId) return;

    const initializeGoogleAuth = () => {
      if (window.google && window.google.accounts) {
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
          setError("Error inicializando Google Auth. Verifica la consola.");
        }
      }
    };

    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        initializeGoogleAuth();
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [clientId]);

  const handleCredentialResponse = (response: any) => {
    const payload = parseJwt(response.credential);

    if (payload) {
      const email = payload.email;
      const isAllowed =
        email.endsWith("@funiber.org") || email.endsWith("@uneatlantico.es");

      if (isAllowed) {
        onLogin({
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
        });
      } else {
        setError(
          `El dominio ${email.split("@")[1]} no está autorizado. Solo @funiber.org y @uneatlantico.es`
        );
      }
    } else {
      setError("Error procesando las credenciales de Google.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-sky-600 p-4 rounded-2xl shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-10 h-10 text-white"
            >
              <path d="M3 21V8l9-5 9 5v13" />
              <path d="M9 21v-6h6v6" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Acceso Institucional
        </h1>
        <p className="text-slate-500 mb-8">
          Ingresa con tu cuenta institucional para continuar.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 flex items-center gap-2 text-left">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 flex-shrink-0 mt-0.5"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-center mb-6 min-h-[44px]">
          <div id="googleButtonDiv"></div>
        </div>

        {showClientIdInput ? (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-left">
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
          <span>Solo dominios autorizados:</span>
          <div className="flex gap-2 justify-center font-mono">
            <span className="bg-slate-100 px-2 py-1 rounded">@funiber.org</span>
            <span className="bg-slate-100 px-2 py-1 rounded">
              @uneatlantico.es
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
