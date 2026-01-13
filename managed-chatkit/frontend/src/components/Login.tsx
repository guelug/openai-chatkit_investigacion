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
  "519816706964-anh0ri4i0f5hod28i244knlfeab8konn.apps.googleusercontent.com";

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const clientId = DEFAULT_CLIENT_ID;

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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-600 p-4 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-8 h-8 text-white"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
      </div>
    </div>
  );
};
