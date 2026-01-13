import { useEffect, useMemo, useState } from "react";
import { ChatKitPanel } from "./components/ChatKitPanel";
import { Login } from "./components/Login";
import { N8NAgentPanel } from "./components/N8NAgentPanel";
import { agents, type AgentId } from "./lib/agents";
import { type User } from "./types";

const USER_STORAGE_KEY = "chat_investigacion_user";

export default function App() {
  const [selectedAgent, setSelectedAgent] = useState<AgentId>("chatgpt");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const AgentComponent = useMemo(() => {
    if (selectedAgent === "custom") return <N8NAgentPanel />;
    return <ChatKitPanel />;
  }, [selectedAgent]);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="w-64 border-r border-slate-200 bg-white/80 backdrop-blur-md p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight">Agentes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Selecciona el origen de la conversación.
          </p>
        </div>
        <div className="space-y-2">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${
                selectedAgent === agent.id
                  ? "border-sky-300 bg-sky-50 text-sky-700 shadow-sm dark:border-sky-700/60 dark:bg-sky-900/30"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{agent.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{agent.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {agent.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1">
        <div className="mx-auto flex h-screen max-w-6xl flex-col px-4 py-6">
          <header className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Conversación
              </p>
              <h2 className="text-lg font-semibold">
                {agents.find((a) => a.id === selectedAgent)?.name}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                Cerrar sesión
              </button>
            </div>
          </header>
          <div className="flex-1">{AgentComponent}</div>
        </div>
      </main>
    </div>
  );
}
