import re

with open('src/components/views/DashboardView.tsx', 'r') as f:
    content = f.read()

# We want to find the exact block starting from `                {/* Middle Section: Token Usage & Activity */}`
# up to the end of the Advanced Analytics Grid.

start_str = "                {/* Middle Section: Token Usage & Activity */}"
end_str = "            {isReportModalOpen && ("

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    before = content[:start_idx]
    after = content[end_idx:]
    
    new_grid = """                {/* Dual Column Masonry Layout for All Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12 animate-[fadeIn_0.5s_ease-out] items-start">
                    
                    {/* LEFT COLUMN */}
                    <div className="flex flex-col gap-6 w-full">
                        {/* Token Usage By Agent */}
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl flex flex-col h-[460px] relative overflow-hidden">
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
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl relative overflow-hidden h-[360px] flex flex-col hover:border-[#10b981]/20 transition-all hover:-translate-y-1">
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
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl relative overflow-hidden h-[360px] flex flex-col hover:border-[#8b5cf6]/20 transition-all hover:-translate-y-1">
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
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl relative overflow-hidden h-[360px] flex flex-col items-center hover:border-[#FF8A3D]/20 transition-all hover:-translate-y-1">
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
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl flex flex-col h-[744px] relative overflow-hidden">
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

"""
    
    # Finally, also fix the `h-full` constraint on the container at line 45
    # `<div className="px-8 lg:px-12 py-10 max-w-7xl mx-auto w-full h-full flex flex-col">` => min-h-full
    before = before.replace("w-full h-full flex flex-col", "w-full min-h-full flex flex-col")
    
    with open('src/components/views/DashboardView.tsx', 'w') as out:
        out.write(before + new_grid + after)
        
    print("Dashboard rewrite complete.")

