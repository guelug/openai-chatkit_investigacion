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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-0"
          } transition-all duration-300 overflow-hidden bg-gray-50 border-r border-gray-200 flex flex-col`}
      >
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva conversación
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Agentes
          </p>
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition ${selectedAgent === agent.id
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{agent.icon}</span>
                <span className="text-sm font-medium truncate">{agent.name}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2 py-2">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Cerrar sesión"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 flex items-center px-4 border-b border-gray-200 bg-white">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <h1 className="text-base font-semibold text-gray-800">
            {agents.find((a) => a.id === selectedAgent)?.name}
          </h1>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          {AgentComponent}
        </div>
      </main>
    </div>
  );
}

