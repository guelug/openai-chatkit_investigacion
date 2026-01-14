import { useEffect, useMemo, useState } from "react";
import { ChatKitPanel } from "./components/ChatKitPanel";
import { Login } from "./components/Login";
import { N8NAgentPanel } from "./components/N8NAgentPanel";
import { agents, type AgentId } from "./lib/agents";
import { type User } from "./types";

const USER_STORAGE_KEY = "chat_investigacion_user";
const API_KEY_STORAGE_KEY = "chat_investigacion_api_key";

export default function App() {
  const [selectedAgent, setSelectedAgent] = useState<AgentId>("chatgpt-basic");
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
      const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (storedKey) {
        setApiKey(storedKey);
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

  const handleSaveApiKey = () => {
    const trimmedKey = tempApiKey.trim();
    if (trimmedKey && !trimmedKey.startsWith("sk-")) {
      alert("La API Key debe comenzar con 'sk-'");
      return;
    }
    setApiKey(trimmedKey);
    localStorage.setItem(API_KEY_STORAGE_KEY, trimmedKey);
    setShowApiKeyModal(false);
  };

  const openApiKeyModal = () => {
    setTempApiKey(apiKey);
    setShowApiKeyModal(true);
  };

  const AgentComponent = useMemo(() => {
    if (selectedAgent === "custom") return <N8NAgentPanel />;

    // Find the definition to get the workflowId
    const definition = agents.find(a => a.id === selectedAgent);
    if (!definition?.workflowId) return <div>Error: Workflow ID missing</div>;

    return <ChatKitPanel apiKey={apiKey} workflowId={definition.workflowId} />;
  }, [selectedAgent, apiKey]);


  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">API Key de OpenAI</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Ingresa tu API Key de OpenAI para usar el agente ChatGPT. Se guardará en tu navegador.
            </p>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveApiKey}
                className="flex-1 px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

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
        <header className="h-12 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
          <div className="flex items-center">
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
          </div>

          {/* API Key button */}
          <button
            onClick={openApiKeyModal}
            className={`p-2 rounded-lg transition ${apiKey
              ? "text-emerald-600 hover:bg-emerald-50"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            title={apiKey ? "API Key configurada" : "Configurar API Key"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </button>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          {AgentComponent}
        </div>
      </main>
    </div>
  );
}
