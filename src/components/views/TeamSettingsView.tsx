"use client";

import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/services/authFetch';
import { Users, Mail, Plus, X, ShieldAlert, CheckCircle, Trash2, Edit2, Layers } from 'lucide-react';

import { API_BASE_URL } from "@/services/api";

export default function TeamSettingsView() {
    const [team, setTeam] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteName, setInviteName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteStatus, setInviteStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

    const [quotaModalData, setQuotaModalData] = useState<{ id: number; name: string; currentQuota: number } | null>(null);
    const [newQuota, setNewQuota] = useState(0);
    const [quotaStatus, setQuotaStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

    const adminUser = team.find((u: any) => u.role === 'admin');
    const unallocatedQuota = adminUser ? adminUser.max_agents : 0;

    const fetchTeam = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/admin/workspace/users`);
            if (res.ok) {
                const data = await res.json();
                setTeam(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch team", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteStatus(null);
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/admin/workspace/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: inviteName, email: inviteEmail })
            });
            const data = await res.json();
            
            if (res.ok) {
                setInviteStatus({ type: 'success', msg: 'Invitation sent! A temporary password has been emailed to them.' });
                setInviteName("");
                setInviteEmail("");
                fetchTeam();
            } else {
                setInviteStatus({ type: 'error', msg: data.detail || 'Failed to invite user.' });
            }
        } catch (error) {
            setInviteStatus({ type: 'error', msg: 'An unexpected error occurred.' });
        }
    };

    const handleTogglePermission = async (userId: number, field: 'can_manage_api_keys' | 'can_manage_kb' | 'can_manage_history' | 'can_manage_branding', currentValue: boolean, user: any) => {
        try {
            const body = {
                can_manage_api_keys: field === 'can_manage_api_keys' ? !currentValue : user.can_manage_api_keys,
                can_manage_kb: field === 'can_manage_kb' ? !currentValue : user.can_manage_kb,
                can_manage_history: field === 'can_manage_history' ? !currentValue : user.can_manage_history,
                can_manage_branding: field === 'can_manage_branding' ? !currentValue : user.can_manage_branding,
            };
            const res = await fetchWithAuth(`${API_BASE_URL}/admin/workspace/users/${userId}/permissions`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                fetchTeam();
            }
        } catch (error) {
            console.error("Failed to update permissions", error);
        }
    };

    const handleAllocateQuota = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quotaModalData) return;
        setQuotaStatus(null);
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/admin/workspace/users/${quotaModalData.id}/quota`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ new_quota: newQuota })
            });
            const data = await res.json();
            
            if (res.ok) {
                setQuotaStatus({ type: 'success', msg: data.message });
                fetchTeam();
                setTimeout(() => {
                    setQuotaModalData(null);
                    setQuotaStatus(null);
                }, 1500);
            } else {
                setQuotaStatus({ type: 'error', msg: data.detail || 'Failed to allocate quota.' });
            }
        } catch (error) {
            setQuotaStatus({ type: 'error', msg: 'An unexpected error occurred.' });
        }
    };

    return (
        <main className="flex-1 flex flex-col min-w-0 bg-[#050810] h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-10 py-12 max-w-5xl mx-auto w-full h-full flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
                            Team Management
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base max-w-2xl">
                            Manage your workspace members, invite new users, and allocate agent quotas.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-black/40 border border-emerald-500/30">
                            <Layers className="w-5 h-5 text-emerald-400" />
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unallocated Quota</div>
                                <div className="font-bold text-white leading-tight">{unallocatedQuota} Agents</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsInviting(true)}
                            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto h-[46px]"
                        >
                            <Plus className="w-4 h-4" />
                            Invite Member
                        </button>
                    </div>
                </div>

                {isInviting && (
                    <div className="mb-10 bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <Mail className="w-5 h-5 text-indigo-400" />
                                Invite New Team Member
                            </h2>
                            <button onClick={() => setIsInviting(false)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {inviteStatus && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${inviteStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                {inviteStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                {inviteStatus.msg}
                            </div>
                        )}

                        <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    placeholder="e.g. Jane Doe"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="jane@company.com"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="w-full md:w-auto h-[50px] px-8 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors">
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden flex-1 flex flex-col min-h-0">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Quota</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Permissions</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading team members...</td>
                                    </tr>
                                ) : team.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No team members found.</td>
                                    </tr>
                                ) : (
                                    team.map((user: any) => (
                                        <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{user.name}</div>
                                                        <div className="text-sm text-slate-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md uppercase ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                                                    Active
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-white">
                                                {user.max_agents} <span className="text-slate-500 text-xs ml-1 font-sans">agents</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.role === 'user' && (
                                                    <div className="flex flex-col gap-2">
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only peer" 
                                                                checked={user.can_manage_api_keys} 
                                                                onChange={() => handleTogglePermission(user.id, 'can_manage_api_keys', user.can_manage_api_keys, user)}
                                                            />
                                                            <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500 relative opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                                            <span className="text-xs text-slate-400 font-medium">API Keys</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only peer" 
                                                                checked={user.can_manage_kb} 
                                                                onChange={() => handleTogglePermission(user.id, 'can_manage_kb', user.can_manage_kb, user)}
                                                            />
                                                            <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500 relative opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                                            <span className="text-xs text-slate-400 font-medium">Knowledge Base</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only peer" 
                                                                checked={user.can_manage_history} 
                                                                onChange={() => handleTogglePermission(user.id, 'can_manage_history', user.can_manage_history, user)}
                                                            />
                                                            <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500 relative opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                                            <span className="text-xs text-slate-400 font-medium">History</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only peer" 
                                                                checked={user.can_manage_branding} 
                                                                onChange={() => handleTogglePermission(user.id, 'can_manage_branding', user.can_manage_branding, user)}
                                                            />
                                                            <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500 relative opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                                            <span className="text-xs text-slate-400 font-medium">Widget Branding</span>
                                                        </label>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {user.role === 'user' && (
                                                    <button
                                                        onClick={() => {
                                                            setQuotaModalData({ id: user.id, name: user.name, currentQuota: user.max_agents });
                                                            setNewQuota(user.max_agents);
                                                            setQuotaStatus(null);
                                                        }}
                                                        className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors"
                                                        title="Allocate Quota"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Allocate Quota Modal */}
            {quotaModalData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#050810] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setQuotaModalData(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                            <Layers className="w-6 h-6" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                            Allocate Quota
                        </h2>
                        <p className="text-slate-400 mb-6 text-sm">
                            Manage agent creation limits for <strong className="text-white">{quotaModalData.name}</strong>.
                        </p>

                        {quotaStatus && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${quotaStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                {quotaStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                {quotaStatus.msg}
                            </div>
                        )}

                        <form onSubmit={handleAllocateQuota} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">New Quota Amount</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={newQuota}
                                        onChange={e => setNewQuota(Number(e.target.value))}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-lg font-mono"
                                        required
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                                        Agents
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-slate-500 ml-1">
                                    This will use your unallocated pool of <strong className="text-emerald-400">{unallocatedQuota}</strong> agents.
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full px-5 py-3.5 rounded-xl bg-white text-black font-bold text-sm shadow-lg hover:bg-slate-200 transition-colors"
                            >
                                Confirm Allocation
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
