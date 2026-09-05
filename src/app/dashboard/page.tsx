"use client";

import { useState, useEffect, useRef } from "react";
import ChatSection from "@/components/ChatSection";
import DashboardView from "@/components/views/DashboardView";
import AgentDetailView from "@/components/views/AgentDetailView";
import SettingsView from "@/components/views/SettingsView";
import AgentListView from "@/components/views/AgentListView";
import IntegrationsView from "@/components/views/IntegrationsView";
import DocumentUploadSection from "@/components/Documents/DocumentUploadSection";
import FlowBuilder from "@/components/FlowBuilder";
import OnboardingView from "@/components/views/OnboardingView";
import Head from "next/head";
import { LayoutDashboard, Bot, Database, Blocks, Settings, Menu, ChevronLeft, Plus, X, Search, MoreVertical, Key, Network, Activity, Users, Puzzle, Code, Eye, Trash2, MessageSquare, Timer, AlertCircle } from "lucide-react";

type Tab = "Profile" | "Flow" | "Tools" | "Analytics" | "Test Chat" | "Preview script" | "Settings";
type AppView = "List" | "Agent" | "KnowledgeBase" | "Integrations" | "Dashboard" | "Settings";

const SIDEBAR_ITEMS = ["Dashboard", "My Agents", "Knowledge Base", "Integrations", "Settings"];
const TABS: Tab[] = ["Profile", "Flow", "Tools", "Analytics", "Test Chat", "Preview script", "Settings"];

const API_BASE_URL = "http://localhost:8000/api";

const RobotFace = () => {
  const headRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!headRef.current || !eyesRef.current) return;

      const rect = headRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;

      // Highly responsive distance constraint
      const maxDist = 400; // pixels to hit max rotation
      const percentX = Math.max(-1, Math.min(1, distX / maxDist));
      const percentY = Math.max(-1, Math.min(1, distY / maxDist));

      const faceX = percentX * 12;
      const faceY = percentY * 12;
      const eyeX = percentX * 22; // Much wider eye travel
      const eyeY = percentY * 22;

      headRef.current.style.transform = `translate(${faceX}px, ${faceY}px) rotate(${percentX * 15}deg) rotateX(${percentY * -15}deg) rotateY(${percentX * 20}deg)`;
      eyesRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px) translateZ(20px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ perspective: '800px' }} className="relative w-24 h-24 flex items-center justify-center p-3 cursor-pointer group">
      <div className="absolute inset-2 bg-gradient-to-br from-white to-slate-200 rounded-[2.5rem] shadow-[0_10px_25px_rgba(255,255,255,0.2)] border-b-[3px] border-slate-300 group-hover:scale-105 transition-transform duration-300"></div>

      <div className="absolute left-[-2px] top-6 w-3 h-6 bg-slate-200 rounded-full rotate-[-20deg] shadow-sm -z-10 group-hover:rotate-[-30deg] transition-transform duration-500"></div>
      <div className="absolute right-[-2px] top-6 w-3 h-6 bg-slate-200 rounded-full rotate-[20deg] shadow-sm -z-10 group-hover:rotate-[30deg] transition-transform duration-500"></div>

      <div
        ref={headRef}
        className="relative w-[4.5rem] h-[3.5rem] bg-gradient-to-b from-[#1a1a24] to-[#0b0f19] rounded-[40%] overflow-hidden shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] border border-slate-700/50 z-10 transition-transform duration-75 ease-out"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-x-0 top-0 h-[50%] bg-white/10 rounded-b-full blur-[2px] z-10 pointer-events-none"></div>

        <div
          ref={eyesRef}
          className="absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-75 ease-out pt-1"
        >
          <div className="w-3.5 h-2.5 bg-[#f8fafc] rounded-[2px] shadow-[0_0_8px_#fff,0_0_12px_#38bdf8] opacity-90 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
          </div>
          <div className="w-3.5 h-2.5 bg-[#f8fafc] rounded-[2px] shadow-[0_0_8px_#fff,0_0_12px_#38bdf8] opacity-90 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
          </div>
        </div>

        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-[2px] bg-sky-200/50 rounded-full shadow-[0_0_5px_#38bdf8]"></div>
      </div>
    </div>
  );
}

export default function Home() {
  const [appView, setAppView] = useState<AppView>("Dashboard");
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8000/api/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Unauthorized");
        })
        .then(data => {
          setUser(data);
          setIsLoadingUser(false);
        })
        .catch(err => {
          console.error("Auth failed:", err);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        });
    } else {
      window.location.href = "/";
    }
  }, []);
  const [globalChartData, setGlobalChartData] = useState<any[]>([]);
  const [selectedChartAgent, setSelectedChartAgent] = useState<string>("all");
  const [agents, setAgents] = useState<any[]>([]);
  const [activeAgent, setActiveAgent] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Agent Workspace State
  const [activeTab, setActiveTab] = useState<Tab>("Test Chat");
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [metrics, setMetrics] = useState({ total_conversations: 0, total_messages: 0 });
  const [events, setEvents] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentModel, setNewAgentModel] = useState("GPT-4o");
  const [newAgentRole, setNewAgentRole] = useState("");

  // Integrations state
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({
    openai: "",
    groq: "",
    openrouter: ""
  });

  useEffect(() => {
    const handleGlobalClick = () => {
      if (openDropdown) setOpenDropdown(null);
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [openDropdown]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/agents/`)
      .then(res => res.json())
      .then(data => setAgents(data))
      .catch(console.error);

    fetch(`${API_BASE_URL}/metrics`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error);

    fetch(`${API_BASE_URL}/metrics/events`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(console.error);

    fetch(`${API_BASE_URL}/metrics/global_chart`)
      .then(res => res.json())
      .then(data => setGlobalChartData(data))
      .catch(console.error);

    // Fetch extensions
    fetch(`${API_BASE_URL}/integrations/`)
      .then(res => res.json())
      .then(data => {
        const keys = { ...apiKeys };
        data.forEach((i: any) => {
          if (keys[i.provider] !== undefined) keys[i.provider] = i.api_key;
        });
        setApiKeys(keys);
      })
      .catch(console.error);
  }, [appView]);

  const getSidebarIcon = (item: string) => {
    switch (item) {
      case "Dashboard": return <LayoutDashboard className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />;
      case "My Agents": return <Bot className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />;
      case "Knowledge Base": return <Database className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />;
      case "Integrations": return <Blocks className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />;
      case "Settings": return <Settings className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" />;
    }
  };
  const handleToggleTool = async (tool: string) => {
    if (!activeAgent) return;
    try {
      const currentTools = activeAgent.tools ? JSON.parse(activeAgent.tools) : [];
      const isEnabled = currentTools.includes(tool);
      const newTools = isEnabled ? currentTools.filter((t: string) => t !== tool) : [...currentTools, tool];

      const res = await fetch(`http://localhost:8000/api/agents/${activeAgent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools: JSON.stringify(newTools) })
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveAgent(updated);
        setAgents(agents.map(a => a.id === updated.id ? updated : a));
        showToast(`Capability ${isEnabled ? 'disabled' : 'enabled'} successfully.`, 'success');
      }
    } catch (e) { showToast("Failed to update tools", "error"); }
  };


  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;

    const payload = {
      name: newAgentName,
      model_choice: newAgentModel,
      role: newAgentRole || 'Custom Agent',
      status: 'Draft',
      system_prompt: 'You are a helpful AI assistant.'
    };

    try {
      const res = await fetch(`${API_BASE_URL}/agents/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      const newAgent = {
        ...data,
        model: data.model_choice,
        imgColor: 'bg-purple-600',
        tokens: 0,
        percentage: 0
      };

      setAgents([...agents, newAgent]);
      setIsCreateModalOpen(false);
      setNewAgentName("");
      setNewAgentRole("");
      setActiveAgent(newAgent);
      setAppView("Agent");
      setActiveTab("Test Chat");
    } catch (error) {
      console.error("Failed to create agent", error);
    }
  };


  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgent) return;

    try {
      const res = await fetch(`${API_BASE_URL}/agents/${activeAgent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: activeAgent.system_prompt,
          status: activeAgent.status,
          temperature: activeAgent.temperature,
          name: activeAgent.name,
          role: activeAgent.role,
          model_choice: activeAgent.model_choice || activeAgent.model
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveAgent(data);
        showToast("Agent configuration merged and published successfully!", "success");
        setAgents(agents.map(a => a.id === activeAgent.id ? { ...a, ...data } : a));
      }
    } catch (error) {
      console.error("Failed to save settings", error);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/agents/${agentId}`, { method: 'DELETE' });
      if (res.ok) {
        setAgents(agents.filter(a => a.id !== agentId));
        if (activeAgent?.id === agentId) {
          setActiveAgent(null);
          setAppView("List");
        }
        showToast("Agent successfully deleted.", "success");

      }
    } catch (error) {
      console.error("Failed to delete agent", error);
      showToast("Failed to delete agent.", "error");
    }
  };

  const handleDeleteIntegration = async (provider: string) => {
    if (!window.confirm(`Remove ${provider} integration?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/integrations/${provider}`, { method: 'DELETE' });
      if (res.ok) {
        setApiKeys({ ...apiKeys, [provider]: "" });
      }
    } catch (error) {
      console.error("Failed to delete integration", error);
    }
  };

  const availableModels = [
    { name: "llama3.2", label: "Llama 3.2 (Local Fallback)" },
    ...(apiKeys.openai ? [
      { name: "gpt-4o", label: "GPT-4o (OpenAI)" },
      { name: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (OpenAI)" }
    ] : []),
    ...(apiKeys.groq ? [
      { name: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Groq)" },
      { name: "mixtral-8x7b-32768", label: "Mixtral 8x7B (Groq)" }
    ] : []),
    ...(apiKeys.openrouter ? [
      { name: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet (OpenRouter)" }
    ] : [])
  ];

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveIntegration = async (provider: string) => {
    const key = apiKeys[provider];
    if (!key || key.trim() === "") {
      showToast(`Please add an API key for ${provider.toUpperCase()} first!`, "error");
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/integrations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: key })
      });
      showToast(`${provider.toUpperCase()} API Key saved securely!`);
    } catch (e) {
      showToast(`Failed to save ${provider.toUpperCase()} API Key.`, "error");
    }
  };

  const handleOpenAgent = (agent: any) => {
    setActiveAgent(agent);
    setAppView("Agent");
    setActiveTab("Test Chat");
  };

  if (isLoadingUser) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#050810] text-[#ECEAE4]">
        <svg className="animate-spin h-6 w-6 text-[#FF8A3D]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full font-sans bg-[#050810] text-slate-300 overflow-hidden font-sans relative">
      {user && user.has_completed_onboarding === false && (
        <OnboardingView
          userName={user.name}
          onComplete={() => setUser({ ...user, has_completed_onboarding: true })}
        />
      )}
      <Head>
        <title>Orqeva™ — AI Agent Orchestration Platform</title>
      </Head>

      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="md:hidden fixed top-5 left-5 z-40 p-2.5 bg-[#0b0f19] border border-white/10 rounded-xl hover:bg-white/5 transition-colors shadow-xl shadow-black/50"
      >
        <Menu className="w-5 h-5 text-slate-300" />
      </button>

      {/* Global Sidebar (Always Present on Desktop, Toggle on Mobile) */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isMobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[280px] flex-shrink-0 border-r border-white/[0.05] bg-[#05060b] flex flex-col items-center py-8 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="w-full flex justify-end px-4 md:hidden mb-2">
          <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-extrabold text-white mb-10 md:mb-12 tracking-tight flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8A3D] to-[#E67E22] flex items-center justify-center shadow-lg shadow-[#FF8A3D]/20">
            <Bot className="w-5 h-5 text-white" />
          </div> Orqeva™
        </div>
        <nav className="w-full px-4 flex flex-col gap-2 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = appView === item || (item === "My Agents" && appView === "List") || (item === "Knowledge Base" && appView === "KnowledgeBase");
            return (
              <button
                key={item}
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  if (item === "Dashboard") setAppView("Dashboard");
                  if (item === "My Agents") setAppView("List");
                  if (item === "Knowledge Base") setAppView("KnowledgeBase");
                  if (item === "Integrations") setAppView("Integrations");
                  if (item === "Settings") setAppView("Settings");
                }}
                className={`group w-full text-left px-5 py-3.5 mb-1.5 rounded-2xl flex items-center gap-4 transition-all duration-300 cursor-pointer ${isActive ? "bg-white/[0.06] text-white font-bold shadow-lg shadow-black/20" : "text-slate-400 font-medium hover:bg-white/[0.03] hover:text-slate-200"}`}
              >
                <div className={`flex items-center justify-center ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-[#FF8A3D]"} transition-colors duration-300`}>
                  {getSidebarIcon(item)}
                </div>
                {item}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto pb-6 w-full flex flex-col items-center justify-center">
          {user ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500/30">
                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">{user.email?.charAt(0).toUpperCase()}</div>}
              </div>
              <span className="text-xs text-slate-400 font-medium px-4 text-center break-all">{user.email}</span>
            </div>
          ) : (
            <RobotFace />
          )}
        </div>
      </aside>

      {/* Main Application Area (Dynamic based on appView) */}
      {appView === "Dashboard" ? (
        <DashboardView
          metrics={metrics}
          globalChartData={globalChartData}
          agents={agents}
          events={events}
          selectedChartAgent={selectedChartAgent}
          setSelectedChartAgent={setSelectedChartAgent}
          setActiveAgent={setActiveAgent}
          setAppView={setAppView}
          setActiveTab={setActiveTab}
        />
      ) : appView === "Settings" ? (
        <SettingsView showToast={showToast} user={user} setUser={setUser} />
      ) : appView === "List" ? (
        <>
          <AgentListView
            agents={agents}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            handleDeleteAgent={handleDeleteAgent}
            handleOpenAgent={handleOpenAgent}
            setIsCreateModalOpen={setIsCreateModalOpen}
          />

          {/* Create Agent Modal Overlay */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
              <div className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden cursor-default" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                  <h2 className="text-xl font-bold text-white">Create New Agent</h2>
                  <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateAgent} className="p-6 flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Agent Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={newAgentName}
                      onChange={e => setNewAgentName(e.target.value)}
                      placeholder="e.g. Acme Support Bot"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Role / Description</label>
                    <input
                      type="text"
                      value={newAgentRole}
                      onChange={e => setNewAgentRole(e.target.value)}
                      placeholder="e.g. Sales Assistant"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Model</label>
                    <select
                      value={newAgentModel}
                      onChange={(e) => setNewAgentModel(e.target.value)}
                      className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all appearance-none cursor-pointer"
                    >
                      {availableModels.map(m => (
                        <option key={m.name} value={m.name}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#ECEAE4] hover:bg-white text-[#0A0B0C]  text-white rounded-xl font-medium shadow-lg shadow-[rgba(255,138,61,0.2)] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      Create Agent
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : appView === "KnowledgeBase" ? (
        // --- KNOWLEDGE BASE VIEW ---
        <main className="flex-1 flex flex-col min-w-0 bg-[#050810] h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-10 py-12 max-w-6xl mx-auto w-full h-full flex flex-col">
            <DocumentUploadSection
              selectedDocument={selectedDocument}
              onSelect={setSelectedDocument}
              refreshKey={refreshKey}
              onUploadSuccess={() => setRefreshKey(k => k + 1)}
              agents={agents}
            />
          </div>
        </main>
      ) : appView === "Integrations" ? (
        // --- INTEGRATIONS VIEW ---
        <main className="flex-1 flex flex-col min-w-0 bg-[#050810] h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-10 py-12 max-w-4xl mx-auto w-full h-full flex flex-col">
            <div className="mb-10 animate-[fadeIn_0.3s_ease-out]">
              <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
              <p className="text-slate-400">Connect external LLM providers by securely entering your API keys below.</p>
            </div>

            <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
              {/* OpenAI Integration Card */}
              <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-5 group hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/5 group-hover:bg-[#FF8A3D]/10 group-hover:text-[#FF8A3D] transition-colors">
                      <Key className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold text-white">OpenAI</h3>
                      <p className="text-[13px] text-slate-400">Connect GPT-4, GPT-4 Turbo, and GPT-3.5 models.</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type={showKey['openai'] ? "text" : "password"}
                      placeholder="sk-..."
                      value={apiKeys.openai || ""}
                      onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all font-mono text-sm placeholder:font-sans"
                    />
                    <Key className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <button onClick={() => setShowKey({ ...showKey, openai: !showKey['openai'] })} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  {apiKeys.openai && apiKeys.openai !== "" && (
                    <button onClick={() => handleDeleteIntegration('openai')} className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl font-medium transition-colors border border-rose-500/20 active:scale-95 flex-shrink-0 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleSaveIntegration('openai')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10 active:scale-95 flex-shrink-0 cursor-pointer">
                    Connect
                  </button>
                </div>
              </div>

              {/* Groq Integration Card */}
              <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-5 group hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/5 group-hover:bg-emerald-500/10 transition-colors">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold text-white">Groq</h3>
                      <p className="text-[13px] text-slate-400">Unlock blazing fast LPI with Groq's specialized inference engine.</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type={showKey['groq'] ? "text" : "password"}
                      placeholder="gsk_..."
                      value={apiKeys.groq || ""}
                      onChange={(e) => setApiKeys({ ...apiKeys, groq: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all font-mono text-sm placeholder:font-sans"
                    />
                    <Key className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <button onClick={() => setShowKey({ ...showKey, groq: !showKey['groq'] })} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  {apiKeys.groq && apiKeys.groq !== "" && (
                    <button onClick={() => handleDeleteIntegration('groq')} className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl font-medium transition-colors border border-rose-500/20 active:scale-95 flex-shrink-0 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleSaveIntegration('groq')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10 active:scale-95 flex-shrink-0 cursor-pointer">
                    Connect
                  </button>
                </div>
              </div>

              {/* OpenRouter Integration Card */}
              <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-5 group hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5 group-hover:bg-blue-500/10 transition-colors">
                      <Network className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold text-white">OpenRouter</h3>
                      <p className="text-[13px] text-slate-400">Route requests dynamically to multiple AI models and endpoints.</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type={showKey['openrouter'] ? "text" : "password"}
                      placeholder="sk-or-v1-..."
                      value={apiKeys.openrouter || ""}
                      onChange={(e) => setApiKeys({ ...apiKeys, openrouter: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all font-mono text-sm placeholder:font-sans"
                    />
                    <Key className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <button onClick={() => setShowKey({ ...showKey, openrouter: !showKey['openrouter'] })} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  {apiKeys.openrouter && apiKeys.openrouter !== "" && (
                    <button onClick={() => handleDeleteIntegration('openrouter')} className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl font-medium transition-colors border border-rose-500/20 active:scale-95 flex-shrink-0 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleSaveIntegration('openrouter')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10 active:scale-95 flex-shrink-0 cursor-pointer">
                    Connect
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      ) : (
        <AgentDetailView
          activeAgent={activeAgent}
          setActiveAgent={setActiveAgent}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          globalChartData={globalChartData}
          agents={agents}
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
          refreshKey={refreshKey}
          setRefreshKey={setRefreshKey}
          appView={appView}
          setAppView={setAppView}
          showToast={showToast}
        />
      )}

      {/* Global Toast Notification Engine */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-[slideUp_0.3s_ease-out] z-[999] ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
          {toast.type === 'success' ? <Activity className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
