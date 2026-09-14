import { fetchWithAuth } from "@/services/authFetch";
import { API_BASE_URL, BASE_URL } from "@/services/api";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Blocks, Bot, Settings, Activity, FileText, Search, Plus, Sparkles, MessageSquare,
  Trash2, X, AlertCircle, Save, Sliders, ChevronDown, Check, LayoutGrid, Plug, Database, MoreVertical, CreditCard,
  ChevronLeft, Timer, Puzzle, Code, Image as ImageIcon, PaintBucket
} from 'lucide-react';
import ChatSection from "@/components/ChatSection";
import DocumentUploadSection from "@/components/Documents/DocumentUploadSection";
import FlowBuilder from "@/components/FlowBuilder";

const ALL_TABS = ["Profile", "Flow", "Tools", "Analytics", "Widget Branding", "History", "Test Chat", "Preview script", "Settings"];

export default function AgentDetailView({
  activeAgent,
  setActiveAgent,
  activeTab,
  setActiveTab,
  globalChartData,
  agents,
  selectedDocument,
  setSelectedDocument,
  refreshKey,
  setRefreshKey,
  appView,
  setAppView,
  showToast,
  user
}: any) {
  if (!activeAgent) return null;
  const [agentState, setAgentState] = React.useState(activeAgent || {});
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  let availableTabs = [...ALL_TABS];
  if (user?.role === 'user') {
    if (!user.can_manage_branding) {
      availableTabs = availableTabs.filter(t => t !== "Widget Branding");
    }
    if (!user.can_manage_history) {
      availableTabs = availableTabs.filter(t => t !== "History");
    }
  }


  // Widget Branding States
  const [overrideGlobalBranding, setOverrideGlobalBranding] = React.useState(false);

  const [primaryColor, setPrimaryColor] = React.useState("#8b5cf6");
  const [removeWatermark, setRemoveWatermark] = React.useState(false);
  const [customBrandName, setCustomBrandName] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // History / Trancript View States
  const [historySessions, setHistorySessions] = React.useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (activeAgent && activeTab === "History") {
      fetchWithAuth(`${API_BASE_URL}/agents/${activeAgent.id}/sessions`)
        .then(res => res.json())
        .then(data => {
          setHistorySessions(data || []);
          if (data && data.length > 0 && !selectedSessionId) {
            setSelectedSessionId(data[0].id);
          }
        })
        .catch(console.error);
    }
  }, [activeAgent, activeTab]);

  React.useEffect(() => {
    if (selectedSessionId && activeTab === "History") {
      fetchWithAuth(`${API_BASE_URL}/agents/sessions/${selectedSessionId}/messages`)
        .then(res => res.json())
        .then(data => setSessionMessages(data || []))
        .catch(console.error);
    }
  }, [selectedSessionId, activeTab]);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/agents/sessions/${sessionId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Session deleted successfully", "success");
        setHistorySessions(prev => prev.filter(s => s.id !== sessionId));
        if (selectedSessionId === sessionId) {
          setSelectedSessionId(null);
          setSessionMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete session", "error");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Image too large. Please select a file under 2MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  const [analyticsData, setAnalyticsData] = React.useState<{ user_messages: number, total_tokens: number, avg_latency: number, chart: any[] } | null>(null);

  React.useEffect(() => {
    if (activeAgent && activeTab === "Analytics") {
      fetchWithAuth(`${API_BASE_URL}/agents/${activeAgent.id}/analytics`)
        .then(res => res.json())
        .then(data => setAnalyticsData(data))
        .catch(console.error);
    }
  }, [activeAgent, activeTab]);

  React.useEffect(() => {
    if (activeAgent) {
      setAgentState(activeAgent);
      setHasUnsavedChanges(false);

      setOverrideGlobalBranding(activeAgent.override_global_branding || false);
      setPrimaryColor(activeAgent.primary_color || "#8b5cf6");
      setRemoveWatermark(activeAgent.remove_watermark || false);
      setCustomBrandName(activeAgent.custom_brand_name || "");
      setLogoUrl(activeAgent.logo_url || "");
    }
  }, [activeAgent]);

  const handleAgentStateChange = (field: string, val: any) => {
    setAgentState((prev: any) => ({ ...prev, [field]: val }));
    setHasUnsavedChanges(true);
  };


  const handleSaveBranding = async () => {
    const payload = {
      override_global_branding: overrideGlobalBranding,
      primary_color: primaryColor,
      remove_watermark: removeWatermark,
      custom_brand_name: customBrandName,
      logo_url: logoUrl
    };
    try {
      await fetchWithAuth(`${API_BASE_URL}/agents/${activeAgent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const updatedAgent = { ...agentState, ...payload };
      setAgentState(updatedAgent);
      setActiveAgent(updatedAgent);

      showToast("Agent deployment layout overridden successfully!", "success");
    } catch (e) {
      showToast("Failed to save networking logic.", "error");
    }
  };

  const handleUpdateAgent = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/agents/${activeAgent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentState)
      });
      if (res.ok) {
        setHasUnsavedChanges(false);
        setActiveAgent(agentState);
      }
    } catch (e) {
      console.error(e);
    }
  };


  const handleSaveSettings = (e: any) => {
    e.preventDefault();
    if (handleUpdateAgent) {
      handleUpdateAgent();
    }
  };

  const handleToggleTool = async (toolName: string) => {
    let currentTools: string[] = [];
    if (agentState?.tools) {
      if (typeof agentState.tools === 'string') {
        try { currentTools = JSON.parse(agentState.tools); } catch (e) { }
      } else if (Array.isArray(agentState.tools)) {
        currentTools = [...agentState.tools];
      }
    }

    if (currentTools.includes(toolName)) {
      currentTools = currentTools.filter((t: string) => t !== toolName);
    } else {
      currentTools.push(toolName);
    }

    const stringifiedTools = JSON.stringify(currentTools);
    const updatedAgent = { ...agentState, tools: stringifiedTools };
    setAgentState(updatedAgent);
    setActiveAgent(updatedAgent);

    try {
      await fetchWithAuth(`${API_BASE_URL}/agents/${agentState.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools: stringifiedTools })
      });
      showToast(`Updated tools for ${agentState.name}`);
    } catch (error) {
      console.error(error);
      showToast("Failed to update tools", "error");
    }
  };


  return (
    // --- SINGLE AGENT VIEW (Workspace) ---
    <main className="flex-1 flex flex-col min-w-0">
      <header className="px-4 md:px-8 pt-4 md:pt-8 pb-4 flex flex-col gap-6 w-full">
        <div className="px-2 md:px-6 pt-2 pb-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 bg-transparent gap-4">
          <div className="flex items-start sm:items-center gap-4 md:gap-5 w-full">
            <button onClick={() => { setActiveAgent(null); setAppView("List"); }} className="p-2.5 -ml-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer group shadow-sm border border-white/5">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Dynamic Agent Avatar */}
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#E67E22] flex items-center justify-center shadow-lg shadow-[#FF8A3D]/20 border border-white/10">
              <span className="text-white font-bold text-xl">{activeAgent?.name?.charAt(0).toUpperCase() || 'A'}</span>
            </div>

            <div className="flex flex-col justify-center overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight align-middle truncate max-w-full" style={{ fontFamily: "var(--font-display)" }}>{activeAgent?.name || 'Unnamed Agent'}</h2>
                <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md flex-shrink-0 ${activeAgent?.status?.toLowerCase() === 'disabled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'} uppercase`}>
                  {activeAgent?.status || 'Live'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 font-medium mt-0.5 truncate">{activeAgent?.role || 'Agent Role'}</p>
            </div>
          </div>
          {/* <div className="hidden sm:flex items-center gap-4 bg-[#121826] px-4 py-2 rounded-full border border-white/5 transition-colors hover:bg-white/5 cursor-pointer hover:shadow-lg flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-[#FF8A3D] flex items-center justify-center text-white text-xs font-bold shadow-sm">A</div>
            <span className="text-sm font-medium text-slate-200 truncate">Arun Admin</span>
          </div> */}
        </div>

        <div className="flex gap-2 border-b border-white/10 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-0 mt-2 md:mt-4 rounded-xl bg-white/5 p-1 px-2 border-0 w-full">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 rounded-lg whitespace-nowrap cursor-pointer ${activeTab === tab
                ? "text-white bg-white/10 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-8 pt-4">
        <div className="w-full h-full bg-[#0b0f19] rounded-2xl border border-white/5 shadow-2xl flex flex-col overflow-hidden relative transition-all duration-500">
          {activeTab === "Test Chat" && (
            <div className="h-full w-full animate-[fadeIn_0.3s_ease-out]">
              <ChatSection agentId={activeAgent.id} selectedDocument={selectedDocument} />
            </div>
          )}

          {activeTab === "Preview script" && (
            <div className="h-full w-full p-8 animate-[fadeIn_0.3s_ease-out] flex flex-col max-w-5xl mx-auto overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Widget Script</h2>
                <p className="text-slate-400">Embed <span className="font-semibold text-white">{activeAgent?.name}</span> onto your website by pasting the following initialization script anywhere inside your HTML <code className="text-[#FF8A3D]/80">&lt;head&gt;</code> or <code className="text-[#FF8A3D]/80">&lt;body&gt;</code> tags.</p>
              </div>

              <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 shadow-xl relative group">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-xs font-medium text-slate-500">HTML embed</span>
                </div>
                <pre className="text-sm text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">{`<!-- Orqeva Agent Embedded Script -->\n<script src="${BASE_URL}/embed/widget.js" data-agent-id="${activeAgent?.id}" async defer></script>`}</pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`<!-- Orqeva Agent Embedded Script -->\n<script src="${BASE_URL}/embed/widget.js" data-agent-id="${activeAgent?.id}" async defer></script>`);
                    showToast("Embed block securely copied to your clipboard!", "success");
                  }}
                  className="absolute top-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  Copy Code
                </button>
              </div>

              <div className="mt-6 bg-[#FF8A3D]/10 border border-[#FF8A3D]/20 rounded-xl p-4 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF8A3D]/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-[#FF8A3D]" />
                </div>
                <p className="text-sm text-[#ECEAE4]/80 leading-relaxed">
                  Once installed, the chat widget will automatically inherit your agent's custom instructions, knowledge base documents, and model settings.
                </p>
              </div>
            </div>
          )}

          {activeTab === "Flow" && (
            <div className="flex-1 w-full h-[85vh] p-8 animate-[fadeIn_0.3s_ease-out] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="w-full h-full max-w-6xl mx-auto flex flex-col">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">Agent Workflow Mapping</h2>
                  <p className="text-slate-400">Visually architect the execution parameters of this agent. Route capabilities, define logic matrices, and sculpt autonomous behaviors via the canvas below.</p>
                </div>

                <div className="flex-1 min-h-0 w-full mb-8">
                  <FlowBuilder agent={activeAgent} showToast={showToast} />
                </div>
              </div>
            </div>
          )}


          {activeTab === "Widget Branding" && (
            <div className="flex-1 w-full p-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-[fadeIn_0.3s_ease-out]">
              <div className="max-w-4xl mx-auto space-y-8">

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Widget Appearance</h2>
                  <p className="text-slate-400">Customize exactly how <span className="text-white font-medium">{activeAgent?.name}</span> appears when deployed via script.</p>
                </div>

                {/* OVERRIDE TOGGLE BLOCK */}
                <div className={`border ${overrideGlobalBranding ? 'border-[#FF8A3D]/50 bg-[#FF8A3D]/10' : 'border-white/5 bg-[#121826]'} rounded-2xl p-6 shadow-xl transition-colors`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">Override Global Branding defaults</h3>
                      <p className="text-sm text-slate-400 mt-1 max-w-sm">Detach this agent from your universal account styles to define hyper-specific custom widget parameters exclusively.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                      <input type="checkbox" className="sr-only peer" checked={overrideGlobalBranding} onChange={() => setOverrideGlobalBranding(!overrideGlobalBranding)} />
                      <div className="w-12 h-7 bg-[#0b0f19] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[calc(100%+2px)] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-[#FF8A3D] border border-white/10 peer-checked:border-[#FF8A3D] shadow-inner"></div>
                    </label>
                  </div>
                </div>

                {/* CONDITIONAL RENDER BLOCK */}
                <div className={`space-y-8 transition-all duration-300 ${overrideGlobalBranding ? 'opacity-100 max-h-[2000px]' : 'opacity-50 pointer-events-none grayscale max-h-[800px] blur-[1px]'}`}>

                  <div className="border border-white/5 bg-[#121826] rounded-2xl p-8 shadow-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#FF8A3D]" /> Custom Agent Logo</h3>
                        <p className="text-sm text-slate-400 mt-1 max-w-sm">Overrides the default text avatar deployed inside the chat widget header exclusively for this agent.</p>
                      </div>
                      <div onClick={() => fileInputRef.current?.click()} className="relative w-16 h-16 rounded-xl bg-[#0b0f19] border border-white/10 border-dashed flex items-center justify-center text-slate-500 hover:text-white hover:border-[#FF8A3D] transition-colors cursor-pointer group shadow-inner overflow-hidden">
                        {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                      </div>
                    </div>
                  </div>

                  <div className="border border-white/5 bg-[#121826] rounded-2xl p-8 shadow-xl">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6"><PaintBucket className="w-5 h-5 text-[#FF8A3D]" /> Widget Color Theme</h3>
                    <div className="flex items-center gap-5">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-14 h-14 rounded-xl cursor-pointer border-0 bg-transparent p-0 object-cover"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-base focus:border-[#FF8A3D] focus:outline-none shadow-inner"
                      />
                      <div className="ml-auto flex gap-3">
                        <div className="w-8 h-8 rounded-full cursor-pointer bg-[#FF8A3D] border-2 border-transparent hover:scale-110 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]" onClick={() => setPrimaryColor("#8b5cf6")}></div>
                        <div className="w-8 h-8 rounded-full cursor-pointer bg-[#10b981] border-2 border-transparent hover:scale-110 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]" onClick={() => setPrimaryColor("#10b981")}></div>
                        <div className="w-8 h-8 rounded-full cursor-pointer bg-[#3b82f6] border-2 border-transparent hover:scale-110 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]" onClick={() => setPrimaryColor("#3b82f6")}></div>
                        <div className="w-8 h-8 rounded-full cursor-pointer bg-[#f43f5e] border-2 border-transparent hover:scale-110 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]" onClick={() => setPrimaryColor("#f43f5e")}></div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-white/5 bg-[#121826] rounded-2xl p-8 shadow-xl space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-[#FF8A3D]" /> White-Label Settings</h3>

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-white">Hide Watermark Completely</h4>
                        <p className="text-sm text-slate-400 mt-1 max-w-[85%]">Extinguishes any footer watermark branding across this deployed agent permanently.</p>

                        {!removeWatermark && (
                          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg w-fit border border-amber-500/20 shadow-inner">
                            <AlertCircle className="w-3.5 h-3.5" /> Requires Pro Tier Access
                          </div>
                        )}
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer mt-2">
                        <input type="checkbox" className="sr-only peer" checked={removeWatermark} onChange={() => setRemoveWatermark(!removeWatermark)} />
                        <div className="w-12 h-7 bg-[#0b0f19] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[calc(100%+2px)] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-[#FF8A3D] border border-white/10 peer-checked:border-[#FF8A3D] shadow-inner"></div>
                      </label>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5 flex flex-col gap-3">

                      <label className={`text-sm font-medium transition-colors ${!removeWatermark ? 'text-slate-600' : 'text-slate-400'}`}>Custom Footer Brand Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={customBrandName}
                        onChange={(e) => setCustomBrandName(e.target.value)}
                        disabled={!removeWatermark}
                        className={`w-full max-w-sm bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all outline-none ${!removeWatermark ? 'opacity-30 cursor-not-allowed blur-[0.5px]' : ''}`}
                      />
                      <p className="text-xs text-slate-500">Replaces 'Orqeva' in the bottom footer watermark on the widget.</p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <p className="text-xs text-slate-500">Widget rendering updates will propagate seamlessly via script injection.</p>
                    <button onClick={handleSaveBranding} className="px-6 py-3 bg-[#FF8A3D] hover:bg-[#7c3aed] text-white rounded-xl font-medium shadow-lg shadow-[#FF8A3D]/20 transition-all cursor-pointer flex items-center gap-2">
                      <Check className="w-5 h-5" /> Save Appearance
                    </button>
                  </div>

                </div>
              </div>
            </div >
          )
          }

          {
            activeTab === "History" && (
              <div className="flex-1 w-full h-full flex overflow-hidden animate-[fadeIn_0.3s_ease-out]">

                {/* Left Sidebar - Sessions */}
                <div className="w-1/3 max-w-[320px] border-r border-white/5 bg-[#121826]/30 flex flex-col h-full">
                  <div className="p-5 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white">Chat History</h3>
                    <p className="text-xs text-slate-400 mt-1">Transcripts of widget usage.</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {historySessions.length === 0 ? (
                      <div className="text-slate-500 text-sm text-center mt-10">No chat history available.</div>
                    ) : (
                      historySessions.map(session => (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSessionId(session.id)}
                          className={`p-4 rounded-xl cursor-pointer transition-colors border group relative ${selectedSessionId === session.id ? 'bg-[#FF8A3D]/10 border-[#FF8A3D]/30 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Session</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">{new Date(session.created_at).toLocaleDateString()}</span>
                              <button onClick={(e) => handleDeleteSession(session.id, e)} className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className={`text-xs font-medium ${selectedSessionId === session.id ? 'text-[#FF8A3D]' : 'text-slate-300'} truncate`}>
                            {session.preview_message || "New conversation"}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Sidebar - Transcript Viewer */}
                <div className="flex-1 h-full flex flex-col bg-[#0b0f19]">
                  {!selectedSessionId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">Select a session to view the transcript.</div>
                  ) : (
                    <>
                      <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <MessageSquare className="w-5 h-5 text-[#FF8A3D] flex-shrink-0" />
                          <h3 className="text-sm font-semibold text-white truncate">
                            {historySessions.find(s => s.id === selectedSessionId)?.preview_message || "New conversation"}
                          </h3>
                        </div>
                        <button onClick={(e) => handleDeleteSession(selectedSessionId, e)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {sessionMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-[#FF8A3D] text-white rounded-br-none' : 'bg-[#121826] border border-white/10 text-slate-200 rounded-bl-none'}`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <span className="text-[10px] opacity-70 mt-2 block">{new Date(msg.created_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          }

          {
            activeTab === "Settings" && (
              <div className="h-full w-full p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-[fadeIn_0.3s_ease-out] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="max-w-5xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Agent Configuration</h2>
                    <p className="text-slate-400">Manage operational parameters and custom instructions for {activeAgent.name}.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-8 bg-[#121826]/50 border border-white/5 p-8 rounded-2xl shadow-xl">

                    {/* Status Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">Operational Status</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={activeAgent.status === "Published"}
                              onChange={(e) => setActiveAgent({ ...activeAgent, status: e.target.checked ? "Published" : "Disabled" })}
                            />
                            <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${activeAgent.status === "Published" ? 'bg-[#FF8A3D]' : 'bg-slate-700'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${activeAgent.status === "Published" ? 'transform translate-x-6' : ''}`}></div>
                          </div>
                          <span className="ml-3 font-medium text-slate-300">
                            {activeAgent.status === "Published" ? "Active (Receiving Traffic)" : "Draft / Disabled (Offline)"}
                          </span>
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Disabling this agent immediately blocks all widget and chat requests.</p>
                    </div>

                    <div className="w-full h-[1px] bg-white/5"></div>

                    {/* System Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
                        Custom System Prompt
                        <span className="text-xs px-2 py-1 bg-[#FF8A3D]/20 text-[#FF8A3D]/80 rounded border border-[#FF8A3D]/20">LangChain Injected</span>
                      </label>
                      <p className="mb-4 text-xs text-slate-400">Override the standard baseline instructions with extremely specific parameters for this AI agent. This is passed directly into the system prompt variable during LangGraph compilation.</p>
                      <textarea
                        rows={6}
                        value={activeAgent.system_prompt || ""}
                        onChange={(e) => setActiveAgent({ ...activeAgent, system_prompt: e.target.value })}
                        placeholder="You are a helpful AI assistant..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all font-mono text-sm leading-relaxed"
                      />
                    </div>

                    <div className="w-full h-[1px] bg-white/5"></div>

                    {/* Temperature Slider */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
                        Model Temperature Parameter
                        <span className="text-xs px-2 py-1 bg-[#FF8A3D]/20 text-[#FF8A3D] rounded border border-[#FF8A3D]/20 font-mono">{activeAgent.temperature || 0.0}</span>
                      </label>
                      <p className="mb-4 text-xs text-slate-400">Controls the randomness of the model's responses. Lower values are strict and analytical, while higher values are more creative. For RAG, a value closer to 0.0 is vastly preferred.</p>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={activeAgent.temperature || 0.0}
                        onChange={(e) => setActiveAgent({ ...activeAgent, temperature: parseFloat(e.target.value) })}
                        className="w-full accent-[#8b5cf6] cursor-pointer"
                      />
                      <div className="flex justify-between w-full mt-2">
                        <span className="text-xs text-slate-500 font-medium">0.0 (Strict / Accurate)</span>
                        <span className="text-xs text-slate-500 font-medium">1.0 (Creative / Hallucinatory)</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button type="submit" className="px-6 py-2.5 bg-[#FF8A3D] hover:bg-[#7c3aed] text-white rounded-xl font-medium shadow-lg shadow-[#FF8A3D]/20 transition-all cursor-pointer">
                        Save Settings
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )
          }

          {
            activeTab === "Profile" && (
              <div className="flex-1 w-full p-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-[fadeIn_0.3s_ease-out] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="max-w-5xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Agent Identity Profile</h2>
                    <p className="text-slate-400">Basic metadata and core details regarding this worker.</p>
                  </div>
                  <form onSubmit={handleSaveSettings} className="bg-[#121826]/50 border border-white/5 rounded-3xl p-8 shadow-xl flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="block text-xs font-medium text-slate-500 mb-1">Internal Name</span>
                        <input type="text" className="w-full bg-transparent text-lg font-semibold text-white border-b border-transparent hover:border-white/20 focus:border-[#FF8A3D] py-1 transition-colors outline-none" value={activeAgent.name || ""} onChange={e => setActiveAgent({ ...activeAgent, name: e.target.value })} />
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-slate-500 mb-1">Operational Role</span>
                        <input type="text" className="w-full bg-transparent text-lg font-semibold text-white border-b border-transparent hover:border-white/20 focus:border-[#FF8A3D] py-1 transition-colors outline-none" value={activeAgent.role || ""} onChange={e => setActiveAgent({ ...activeAgent, role: e.target.value })} />
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-slate-500 mb-1">Primary LLM</span>
                        <select className="w-full bg-transparent text-lg font-semibold text-white border-b border-transparent hover:border-white/20 focus:border-[#FF8A3D] py-1 transition-colors outline-none cursor-pointer" value={activeAgent.model_choice || activeAgent.model || ""} onChange={e => setActiveAgent({ ...activeAgent, model: e.target.value, model_choice: e.target.value })}>
                          <option value="GPT-4o" className="bg-[#121826]">GPT-4o (OpenAI)</option>
                          <option value="gpt-3.5-turbo" className="bg-[#121826]">GPT-3.5-Turbo (OpenAI)</option>
                          <option value="llama-3.1-8b-instant" className="bg-[#121826]">Llama 3.1 8B (Groq)</option>
                          <option value="mixtral-8x7b-32768" className="bg-[#121826]">Mixtral 8x7b (Groq)</option>
                          <option value="openai/gpt-4o" className="bg-[#121826]">GPT-4o (OpenRouter)</option>
                          <option value="anthropic/claude-3-opus" className="bg-[#121826]">Claude 3 Opus (OpenRouter)</option>
                          <option value="meta-llama/llama-3.1-8b-instruct" className="bg-[#121826]">Llama 3.1 8B (OpenRouter)</option>
                        </select>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-slate-500 mb-1">Unique Agent ID</span>
                        <p className="text-sm font-mono text-slate-300">{activeAgent.id}</p>
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-white/10 pt-6">
                      <button type="submit" className="px-6 py-2 bg-[#FF8A3D] hover:bg-[#E67E22] text-white font-medium rounded-lg transition-colors shadow-lg shadow-[#FF8A3D]/20 active:scale-[0.98]">
                        Save Profile Configuration
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )
          }

          {
            activeTab === "Analytics" && (
              <div className="flex-1 w-full p-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-[fadeIn_0.3s_ease-out] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="max-w-5xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Agent Performance</h2>
                    <p className="text-slate-400">Usage metrics over the last 30 days.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#121826]/80 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                      <div className="text-slate-400 text-sm font-medium mb-3">User Messages</div>
                      <div className="text-3xl font-bold text-white flex items-end gap-3">{analyticsData?.user_messages || 0} <span className="text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded">+{analyticsData?.total_tokens || 0} tokens</span></div>
                      <MessageSquare className="absolute right-4 bottom-4 w-16 h-16 text-white/[0.02] group-hover:text-white/[0.04] transition-colors" />
                    </div>
                    <div className="bg-[#121826]/80 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                      <div className="text-slate-400 text-sm font-medium mb-3">Avg Latency</div>
                      <div className="text-3xl font-bold text-emerald-400">{analyticsData?.avg_latency || "0.00"}s <span className="text-sm text-slate-500 font-normal">per query</span></div>
                      <Timer className="absolute right-4 bottom-4 w-16 h-16 text-emerald-500/[0.03] group-hover:text-emerald-500/[0.06] transition-colors" />
                    </div>
                    <div className="bg-[#121826]/80 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                      <div className="text-slate-400 text-sm font-medium mb-3">Out of Bounds</div>
                      <div className="text-3xl font-bold text-rose-400">0 <span className="text-sm text-rose-500/50 font-normal">RAG declines</span></div>
                      <AlertCircle className="absolute right-4 bottom-4 w-16 h-16 text-rose-500/[0.03] group-hover:text-rose-500/[0.06] transition-colors" />
                    </div>
                  </div>

                  {/* Interactive Dynamic LineChart Box */}
                  <div className="w-full h-64 bg-gradient-to-t from-[#121826] to-transparent rounded-2xl border border-white/5 shadow-xl relative overflow-hidden p-6 pt-8">
                    {(!analyticsData || analyticsData.chart?.every((d: any) => d.tokens === 0)) ? (
                      <div className="w-full h-full absolute inset-0 flex items-center justify-center text-slate-500/50">Awaiting Telemetry Data...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis
                            dataKey="name"
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => val.replace('Day ', '')}
                            dy={10}
                          />
                          <YAxis
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: primaryColor, fontWeight: 600 }}
                            cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="tokens"
                            stroke={primaryColor}
                            strokeWidth={3}
                            dot={{ fill: '#0b0f19', stroke: primaryColor, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#fff', stroke: primaryColor }}
                            animationDuration={1500}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                </div>
              </div>
            )
          }

          {
            activeTab === "Tools" && (
              <div className="flex-1 w-full p-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-[fadeIn_0.3s_ease-out] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="max-w-5xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Attached Capabilities</h2>
                    <p className="text-slate-400">External functional tools this agent has permission to execute.</p>
                  </div>
                  <div className="space-y-4">
                    {["Web Search", "Internal CRM Fetch", "Execute Stripe Refund"].map((tool, i) => {
                      let isEnabled = false;
                      if (activeAgent?.tools) {
                        if (typeof activeAgent.tools === 'string') {
                          try { isEnabled = JSON.parse(activeAgent.tools).includes(tool); } catch (e) { }
                        } else if (Array.isArray(activeAgent.tools)) {
                          isEnabled = activeAgent.tools.includes(tool);
                        }
                      }


                      return (
                        <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border ${isEnabled ? 'bg-[#121826] border-[#FF8A3D]/50 shadow-[0_0_15px_rgba(99,102,241,0.15)] opacity-100' : 'bg-[#121826]/50 border-white/5 group hover:bg-[#121826]'} transition-colors`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${isEnabled ? 'bg-[#FF8A3D]/20 text-[#FF8A3D]' : 'bg-slate-800 text-slate-400'} flex items-center justify-center transition-colors`}><Puzzle className="w-5 h-5" /></div>
                            <span className={`font-medium ${isEnabled ? 'text-white' : 'text-slate-300'}`}>{tool}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer" onClick={() => handleToggleTool(tool)}>
                            <div className={`w-11 h-6 rounded-full peer transition-colors border ${isEnabled ? 'bg-[#FF8A3D] border-[#FF8A3D]' : 'bg-slate-800 border-white/10'}`}>
                              <div className={`absolute top-[2px] left-[2px] bg-slate-300 rounded-full h-5 w-5 transition-all ${isEnabled ? 'translate-x-full !bg-white' : ''}`}></div>
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          }

          {
            activeTab !== "History" && activeTab !== "Test Chat" && activeTab !== "Preview script" && activeTab !== "Flow" && activeTab !== "Settings" && activeTab !== "Profile" && activeTab !== "Analytics" && activeTab !== "Tools" && activeTab !== "Widget Branding" && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 animate-[fadeIn_0.3s_ease-out]">
                {/* Abstract icons based on activeTab */}
                <Blocks className="w-16 h-16 opacity-20 mb-4 animate-pulse" />

                <span>{activeTab} is under construction...</span>
              </div>
            )
          }
        </div >
      </div >
    </main >
  );
}
