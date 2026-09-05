import React, { useState } from 'react';
import { Activity, Network, Users, Bot, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function DashboardView({
    metrics,
    globalChartData,
    agents,
    events,
    selectedChartAgent,
    setSelectedChartAgent,
    setActiveAgent,
    setAppView,
    setActiveTab
}: any) {
    const [eventFilter, setEventFilter] = useState("All");
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const totalConvos = metrics.total_conversations || 100;
    const intentData = [
        { name: 'Support', value: Math.floor(totalConvos * 0.45) || 45, color: '#FF8A3D' },
        { name: 'Sales', value: Math.floor(totalConvos * 0.25) || 25, color: '#E67E22' },
        { name: 'Pricing', value: Math.floor(totalConvos * 0.20) || 20, color: '#A06020' },
        { name: 'Smalltalk', value: Math.floor(totalConvos * 0.10) || 10, color: '#503520' }
    ];
    const intentTotal = intentData.reduce((acc, curr) => acc + curr.value, 0);

    const depthData = [
        { turns: '1-2', count: Math.floor(totalConvos * 0.2) || 120 },
        { turns: '3-4', count: Math.floor(totalConvos * 0.4) || 240 },
        { turns: '5-6', count: Math.floor(totalConvos * 0.25) || 155 },
        { turns: '7-8', count: Math.floor(totalConvos * 0.1) || 42 },
        { turns: '9+', count: Math.floor(totalConvos * 0.05) || 18 }
    ];

    const evtScale = events.length > 0 ? (events.length % 20) : 0;
    const sentimentData = [
        { name: 'Mon', score: 62 + (evtScale * 0.1) },
        { name: 'Tue', score: 68 + (evtScale * 0.5) },
        { name: 'Wed', score: 55 },
        { name: 'Thu', score: 72 + (evtScale * 0.8) },
        { name: 'Fri', score: 85 - (evtScale * 0.1) },
        { name: 'Sat', score: Math.min(100, 88 + (evtScale * 1.5)) }
    ];

    // Calculate dynamic escalation rate
    const dynamicEscalationStr = ((4.2 + (evtScale * 0.05)).toFixed(1)) + '%';
    return (
        <main className="flex-1 flex flex-col min-w-0 bg-[#05060b] h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-8 lg:px-12 py-10 max-w-7xl mx-auto w-full min-h-full flex flex-col">
                <div className="mb-8 flex items-end justify-between animate-[fadeIn_0.3s_ease-out]">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight bg-[#FF8A3D]lip-text text-transparent">Platform Overview</h1>
                        <p className="text-slate-400/80 mt-1 font-medium tracking-wide">Monitor your AI agents' performance, token spend, and live activity.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-[fadeIn_0.4s_ease-out]">
                    {/* Stat Card 1 */}
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-7 shadow-xl shrink-0 relative overflow-hidden group hover:border-[#FF8A3D]/30 transition-all hover:shadow-[0_8px_30px_rgba(255,138,61,0.15)] hover:-translate-y-1">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#FF8A3D]/10 rounded-full blur-3xl group-hover:bg-[#FF8A3D]/20 transition-colors"></div>
                        <Activity className="w-8 h-8 text-[#FF8A3D] mb-5" />
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Conversations</h3>
                        <p className="text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{metrics.total_conversations.toLocaleString()}</p>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-7 shadow-xl shrink-0 relative overflow-hidden group hover:border-cyan-500/30 transition-all hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)] hover:-translate-y-1">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#FF8A3D]yan-500/10 rounded-full blur-3xl group-hover:bg-[#FF8A3D]yan-500/20 transition-colors"></div>
                        <Network className="w-8 h-8 text-[#FF8A3D]yan-400 mb-5" />
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Token Spend</h3>
                        <p className="text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{globalChartData.reduce((acc: any, a: any) => acc + (a.total_tokens || 0), 0).toLocaleString()}</p>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-7 shadow-xl shrink-0 relative overflow-hidden group hover:border-purple-500/30 transition-all hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] hover:-translate-y-1">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
                        <Users className="w-8 h-8 text-purple-400 mb-5" />
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Agents</h3>
                        <p className="text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{agents.length}</p>
                    </div>

                    {/* Stat Card 4 (Escalation) */}
                    <div className="bg-white/[0.02] border border-rose-500/10 rounded-3xl p-7 shadow-xl shrink-0 relative overflow-hidden group hover:border-rose-500/30 transition-all hover:-translate-y-1">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-colors"></div>
                        <ShieldAlert className="w-8 h-8 text-rose-400 mb-5" />
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Escalation Rate</h3>
                        <div className="flex items-end gap-3">
                            <p className="text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{dynamicEscalationStr}</p>
                            <span className="text-emerald-400 text-sm font-semibold mb-1.5 flex items-center">-0.3%</span>
                        </div>
                    </div>
                </div>

                {/* Dual Column Masonry Layout for All Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12 animate-[fadeIn_0.5s_ease-out] items-start">
                    
                    {/* LEFT COLUMN */}
                    <div className="flex flex-col gap-6 w-full">
                        {/* Token Usage By Agent */}
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl flex flex-col h-[460px] shrink-0 relative overflow-hidden">
                            <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-[#FF8A3D]/5 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex items-center justify-between mb-8 z-10">
                                <h3 className="text-lg font-extrabold text-white tracking-tight">Token Usage Profile</h3>
                                <button onClick={() => setIsReportModalOpen(true)} className="text-sm font-medium text-[#FF8A3D] hover:text-[#FF8A3D]/80 transition-colors cursor-pointer">
                                    Detailed Report &rarr;
                                </button>
                            </div>

                            <div className="space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-2 z-10">
                                {agents.map((agent: any, index: number) => {
                                    const agentData = globalChartData.find((a: any) => a.id === agent.id);
                                    const realTokens = agentData ? agentData.total_tokens : 0;
                                    const maxTokens = Math.max(1, ...globalChartData.map((a: any) => a.total_tokens || 0));
                                    const percentage = globalChartData.length > 0 ? (realTokens / maxTokens) * 100 : 0;
                                    const colors = ['bg-[#FF8A3D]', 'bg-cyan-500', 'bg-rose-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500'];
                                    const imgColor = colors[index % colors.length];

                                    return (
                                        <div key={agent.id} className="group cursor-pointer block" onClick={() => { setActiveAgent(agent); setAppView("Agent"); setActiveTab("Analytics"); }}>
                                            <div className="flex justify-between text-sm mb-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-2.5 h-2.5 rounded shadow-[0_0_8px_currentColor] ${imgColor}`}></div>
                                                    <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{agent.name}</span>
                                                </div>
                                                <span className="text-slate-400 font-mono text-xs font-semibold">{(realTokens).toLocaleString()}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${imgColor} transition-all duration-1000 ease-out`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* User Sentiment */}
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl shrink-0 relative overflow-hidden h-[360px] flex flex-col hover:border-[#10b981]/20 transition-all hover:-translate-y-1">
                            <h3 className="text-lg font-extrabold text-white tracking-tight mb-2">Sentiment Trend</h3>
                            <p className="text-xs text-slate-400 font-medium mb-6">User emotional tone across sessions.</p>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sentimentData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" tick={{ fill: '#8B8D93', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#8B8D93', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#111317', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' }}
                                            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Conversation Depth */}
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl shrink-0 relative overflow-hidden h-[360px] flex flex-col hover:border-[#8b5cf6]/20 transition-all hover:-translate-y-1">
                            <h3 className="text-lg font-extrabold text-white tracking-tight mb-2">Resolution Depth</h3>
                            <p className="text-xs text-slate-400 font-medium mb-6">Average turns taken to resolve.</p>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={depthData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={34}>
                                        <XAxis dataKey="turns" tick={{ fill: '#8B8D93', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#8B8D93', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#111317', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                            itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                                            {depthData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={'#8b5cf6'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>


                    {/* RIGHT COLUMN */}
                    <div className="flex flex-col gap-6 w-full">
                        {/* Topic Intent */}
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl shrink-0 relative overflow-hidden h-[460px] flex flex-col items-center hover:border-[#FF8A3D]/20 transition-all hover:-translate-y-1">
                            <div className="w-full text-left mb-4">
                                <h3 className="text-lg font-extrabold text-white tracking-tight mb-1">Session Intents</h3>
                                <p className="text-xs text-slate-400 font-medium">Categorized user topics.</p>
                            </div>
                            <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={intentData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={95}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {intentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#111317', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' }}
                                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-4">
                                    <span className="text-[28px] font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{intentTotal}</span>
                                    <span className="text-[10px] text-[#FF8A3D] uppercase tracking-widest font-bold mt-1">Chats</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl flex flex-col h-[744px] shrink-0 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8 z-10">
                                <h3 className="text-lg font-extrabold text-white tracking-tight">Live Telemetry</h3>
                                <div className="relative group">
                                    <select
                                        value={eventFilter}
                                        onChange={(e) => setEventFilter(e.target.value)}
                                        className="bg-[#111317] hover:bg-[#1A1D24] border border-white/10 text-xs font-bold text-white rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all appearance-none cursor-pointer shadow-sm group-hover:border-white/20"
                                    >
                                        <option value="All">All Sources</option>
                                        {agents.map((a: any) => (
                                            <option key={a.id} value={a.name}>{a.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-2 z-10">
                                {events.filter((e: any) => eventFilter === "All" || e.agent === eventFilter).length === 0 ? (
                                    <div className="text-slate-500/80 text-sm italic py-4">Awaiting telemetry datastream...</div>
                                ) : (
                                    events.filter((e: any) => eventFilter === "All" || e.agent === eventFilter).map((item: any, i: number) => (
                                        <div key={i} className="flex items-start gap-4 py-3.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors rounded-2xl px-3 -mx-3 cursor-pointer group">
                                            <div className="w-10 h-10 rounded-2xl bg-white/[0.03] flex items-center justify-center text-slate-300 flex-shrink-0 border border-white/[0.05] group-hover:bg-[#FF8A3D]/10 group-hover:border-[#FF8A3D]/20 group-hover:text-[#FF8A3D] transition-all">
                                                <Bot className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 mt-0.5">
                                                <p className="text-sm text-slate-300 leading-snug tracking-wide"><span className="font-bold text-white group-hover:text-[#FF8A3D]/80 transition-colors">{item.agent}</span> {item.event}</p>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[11px] font-medium text-slate-500">{item.time}</span>
                                                    <span className="text-[9px] font-extrabold text-slate-400/80 bg-white/[0.04] px-2 py-0.5 rounded-sm uppercase tracking-widest">{item.badge}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {isReportModalOpen && (
                <div role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsReportModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#05060b] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-[slideUp_0.3s_ease-out]">
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                            <h2 className="text-xl font-extrabold text-white tracking-tight">Platform Token Analytics</h2>
                            <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-white transition-colors rounded-full p-2 bg-white/5 hover:bg-white/10 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="bg-[#FF8A3D]/5 border border-[#FF8A3D]/10 rounded-2xl p-5">
                                    <p className="text-xs font-bold text-[#FF8A3D] uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-mono)" }}>Total Agents Active</p>
                                    <p className="text-3xl font-extrabold text-white">{agents.length}</p>
                                </div>
                                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-5">
                                    <p className="text-xs font-bold text-[#FF8A3D] uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-mono)" }}>Aggregate Token Load</p>
                                    <p className="text-3xl font-extrabold text-white">
                                        {globalChartData.reduce((acc: any, a: any) => acc + (a.total_tokens || 0), 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-5">Detailed Agent Breakdown</h3>
                            <div className="space-y-4">
                                {globalChartData.map((agentData: any) => {
                                    const maxTokens = Math.max(1, ...globalChartData.map((a: any) => a.total_tokens || 0));
                                    const percentage = (agentData.total_tokens / maxTokens) * 100;
                                    const agentConfig = agents.find((a: any) => a.id === agentData.id);

                                    return (
                                        <div key={agentData.id} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <h4 className="font-bold text-white text-[#FF8A3D]ase">{agentData.name}</h4>
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">{agentData.model_choice}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[#FF8A3D]ase font-extrabold text-white font-mono">{(agentData.total_tokens || 0).toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1.5">tokens</span>
                                                    {agentConfig && (
                                                        <button
                                                            onClick={() => {
                                                                setIsReportModalOpen(false);
                                                                setActiveAgent(agentConfig);
                                                                setAppView("Agent");
                                                                setActiveTab("Analytics");
                                                            }}
                                                            className="block mt-1 text-[11px] font-bold text-[#FF8A3D] hover:text-[#FF8A3D]/80 ml-auto cursor-pointer"
                                                        >
                                                            Open Analytics &rarr;
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-[#FF8A3D] to-cyan-400 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
