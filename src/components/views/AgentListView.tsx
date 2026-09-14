import React from 'react';
import { Search, Plus, MoreVertical, Trash2 } from 'lucide-react';

export default function AgentListView({
    agents,
    openDropdown,
    setOpenDropdown,
    handleDeleteAgent,
    handleOpenAgent,
    setIsCreateModalOpen,
    user,
    setIsUserQuotaRequestModalOpen
}: any) {
    return (
        <main className="flex-1 flex flex-col min-w-0 bg-[#050810] h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-10 py-12 max-w-6xl mx-auto w-full">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Agents</h1>
                        <p className="text-slate-400">Manage and create specialized AI agents for your business.</p>
                    </div>

                    <button
                        onClick={() => {
                            if (user?.role === 'user' && agents.length >= (user?.max_agents || 0)) {
                                setIsUserQuotaRequestModalOpen(true);
                            } else {
                                setIsCreateModalOpen(true);
                            }
                        }}
                        className="flex items-center gap-2 bg-[#FF8A3D] hover:brightness-110 active:scale-95 transition-all text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-[#8b5cf6]/20 cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                        Create Agent
                    </button>
                </div>

                {/* Search Bar Placeholder */}
                <div className="mb-8 relative max-w-md">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search agents..."
                        className="w-full bg-[#0b0f19] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/50 transition-all"
                    />
                </div>

                {/* Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map((agent: any) => (
                        <div
                            key={agent.id}
                            onClick={() => handleOpenAgent(agent)}
                            className="bg-gradient-to-b from-[#0b0f19] to-[#070b13] border border-white/5 rounded-3xl p-7 hover:border-[#8b5cf6]/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all cursor-pointer group relative overflow-hidden"
                        >
                            {/* Decorative Background Blob */}
                            <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:opacity-40 transition-opacity blur-3xl rounded-full ${agent.model_choice?.includes('llama') ? 'bg-[#FF8A3D]' : (agent.model_choice?.includes('gemma') ? 'bg-rose-500' : 'bg-emerald-500')}`}></div>

                            {/* Dropdown Menu */}
                            <div className={`absolute top-5 right-5 z-10 ${openDropdown === agent.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === agent.id ? null : agent.id); }} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer bg-[#0b0f19]/80 backdrop-blur-sm">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                                {openDropdown === agent.id && (
                                    <div className="absolute right-0 top-full mt-2 w-36 bg-[#121826] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); handleDeleteAgent(agent.id); }}
                                            className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-3 cursor-pointer font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete Agent</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Agent Header */}
                            <div className="flex items-start gap-4 mb-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-black/40 bg-gradient-to-br ${agent.model_choice?.includes('llama') ? 'from-[#FF8A3D] to-[#E67E22]' :
                                        (agent.model_choice?.includes('gemma') ? 'from-rose-500 to-orange-500' : 'from-emerald-500 to-teal-600')
                                    }`}>
                                    {agent.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 mt-1 pr-6">
                                    <h3 className="text-xl font-bold text-white group-hover:text-[#FF8A3D] transition-colors drop-shadow-sm">{agent.name}</h3>
                                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">{agent.role || 'No specific role defined.'}</p>
                                </div>
                            </div>

                            {/* Status badges */}
                            <div className="flex justify-between items-end mt-8 border-t border-white/5 pt-5">
                                <div className="flex gap-2">
                                    <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border shadow-sm ${agent.status?.toLowerCase() === 'published' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20'}`}>
                                        {agent.status || 'DRAFT'}
                                    </span>
                                    {agent.tools && JSON.parse(agent.tools).length > 0 && (
                                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 shadow-sm">
                                            {JSON.parse(agent.tools).length} Tools
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
