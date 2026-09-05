import React from 'react';
import { Key, Eye, Trash2 } from 'lucide-react';

export default function IntegrationsView({
    apiKeys,
    setApiKeys,
    showKey,
    setShowKey,
    handleSaveIntegration,
    handleDeleteIntegration
}: any) {
    return (
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
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/5 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
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
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all font-mono text-sm placeholder:font-sans"
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
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all font-mono text-sm placeholder:font-sans"
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
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-[17px] font-bold text-white">OpenRouter</h3>
                                    <p className="text-[13px] text-slate-400">Connect to open-source models using standard standardized APIs.</p>
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
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all font-mono text-sm placeholder:font-sans"
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
    );
}
