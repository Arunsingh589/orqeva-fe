import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/services/authFetch';
import { Users, Building, FileSignature, Bot, Blocks, CheckCircle, XCircle, ShieldAlert, Key, X, Trash2 } from 'lucide-react';

import { API_BASE_URL } from "@/services/api";

type Tab = "Users" | "Workspaces" | "Access Requests" | "Global Agents" | "Global Integrations";

export default function SuperAdminView({ currentTab }: { currentTab: "Users" | "Workspaces" | "Access Requests" | "Global Agents" | "Global Integrations" }) {
    const [data, setData] = useState<{
        users: any[];
        workspaces: any[];
        requests: any[];
        agents: any[];
        integrations: any[];
    }>({ users: [], workspaces: [], requests: [], agents: [], integrations: [] });
    
    const [isLoading, setIsLoading] = useState(true);

    const [approvalModalData, setApprovalModalData] = useState<{ id: number; request_type: string; defaultQuota: number; name: string } | null>(null);
    const [approvalMaxAgents, setApprovalMaxAgents] = useState(5);
    const [approvalMessage, setApprovalMessage] = useState("");

    const [deleteUserModalData, setDeleteUserModalData] = useState<{ id: number; name: string } | null>(null);
    const [deleteUserMessage, setDeleteUserMessage] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, workspacesRes, reqsRes, agentsRes, intsRes] = await Promise.all([
                fetchWithAuth(`${API_BASE_URL}/admin/users`),
                fetchWithAuth(`${API_BASE_URL}/admin/workspaces`),
                fetchWithAuth(`${API_BASE_URL}/admin/requests`),
                fetchWithAuth(`${API_BASE_URL}/admin/agents`),
                fetchWithAuth(`${API_BASE_URL}/admin/integrations`)
            ]);

            const safeJson = async (res: Response) => {
                if (!res.ok) return [];
                const json = await res.json();
                return Array.isArray(json) ? json : [];
            };

            setData({
                users: await safeJson(usersRes),
                workspaces: await safeJson(workspacesRes),
                requests: await safeJson(reqsRes),
                agents: await safeJson(agentsRes),
                integrations: await safeJson(intsRes)
            });
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openApprovalModal = (req: any) => {
        let defaultQuota = 5;
        if (req.request_type === 'quota' && req.meta_data) {
            try {
                defaultQuota = JSON.parse(req.meta_data).requested_quota || 5;
            } catch(e) {}
        }
        setApprovalMaxAgents(defaultQuota);
        setApprovalMessage("");
        setApprovalModalData({ id: req.id, request_type: req.request_type || 'access', defaultQuota, name: req.name });
    };

    const handleConfirmApproval = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!approvalModalData) return;
        try {
            await fetchWithAuth(`${API_BASE_URL}/admin/requests/${approvalModalData.id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ max_agents: approvalMaxAgents, message: approvalMessage })
            });
            setApprovalModalData(null);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to approve request");
        }
    };

    const handleDecline = async (id: number) => {
        await fetchWithAuth(`${API_BASE_URL}/admin/requests/${id}/decline`, { method: "POST" });
        fetchData();
    };

    const handleConfirmDeleteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deleteUserModalData) return;
        try {
            await fetchWithAuth(`${API_BASE_URL}/admin/users/${deleteUserModalData.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: deleteUserMessage })
            });
            setDeleteUserModalData(null);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to delete user");
        }
    };

    const tabs: { label: Tab; icon: React.ReactNode; count?: number }[] = [
        { label: "Access Requests", icon: <FileSignature className="w-4 h-4" />, count: data.requests.length },
        { label: "Users", icon: <Users className="w-4 h-4" />, count: data.users.length },
        { label: "Workspaces", icon: <Building className="w-4 h-4" />, count: data.workspaces.length },
        { label: "Agents", icon: <Bot className="w-4 h-4" />, count: data.agents.length },
        { label: "Integrations", icon: <Blocks className="w-4 h-4" />, count: data.integrations.length },
    ];

    return (
        <main className="flex-1 flex flex-col min-w-0 bg-[#05060b] h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-8 lg:px-12 py-10 max-w-7xl mx-auto w-full min-h-full flex flex-col">
                <div className="mb-6 flex items-end justify-between animate-[fadeIn_0.3s_ease-out]">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight flex items-center gap-3">
                            <ShieldAlert className="w-8 h-8 text-rose-500" />
                            {currentTab}
                        </h1>
                        <p className="text-slate-400/80 mt-2 font-medium tracking-wide">
                            {currentTab === "Access Requests" && "Manage pending platform access requests."}
                            {currentTab === "Users" && "Manage platform users and quotas."}
                            {currentTab === "Workspaces" && "Manage isolated tenant organizations."}
                            {currentTab === "Global Agents" && "Monitor all AI agents globally."}
                            {currentTab === "Global Integrations" && "Monitor system-wide LLM providers."}
                        </p>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl flex-1 relative overflow-hidden animate-[fadeIn_0.4s_ease-out]">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {currentTab === "Access Requests" && (
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="text-xs uppercase bg-white/[0.04] text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 rounded-tl-xl font-bold">Name</th>
                                            <th className="px-6 py-4 font-bold">Email</th>
                                            <th className="px-6 py-4 font-bold">Type</th>
                                            <th className="px-6 py-4 font-bold">Message / Details</th>
                                            <th className="px-6 py-4 rounded-tr-xl font-bold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.requests.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No pending requests.</td></tr>}
                                        {data.requests.map((r: any) => (
                                            <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">{r.name}</td>
                                                <td className="px-6 py-4">{r.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase ${r.request_type === 'quota' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                        {r.request_type || 'access'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                                                    <div className="italic">{r.message}</div>
                                                    {r.request_type === 'quota' && r.meta_data && (
                                                        <div className="text-purple-400 text-xs mt-1 font-semibold">
                                                            Requested Quota: {JSON.parse(r.meta_data).requested_quota}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-3">
                                                    <button onClick={() => openApprovalModal(r)} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors">
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDecline(r.id)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors">
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {currentTab === "Users" && (
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="text-xs uppercase bg-white/[0.04] text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 rounded-tl-xl font-bold">User</th>
                                            <th className="px-6 py-4 font-bold">Role</th>
                                            <th className="px-6 py-4 font-bold">Workspace ID</th>
                                            <th className="px-6 py-4 font-bold">Quota (Max Agents)</th>
                                            <th className="px-6 py-4 rounded-tr-xl font-bold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.users.map((u: any) => (
                                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-white">{u.name}</div>
                                                    <div className="text-slate-500 text-xs mt-1">{u.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md uppercase 
                                                        ${u.role === 'super_admin' ? 'bg-rose-500/10 text-rose-400' : u.role === 'admin' ? 'bg-[#FF8A3D]/10 text-[#FF8A3D]' : 'bg-sky-500/10 text-sky-400'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{u.workspace_id || 'N/A'}</td>
                                                <td className="px-6 py-4 font-mono">{u.max_agents}</td>
                                                <td className="px-6 py-4 text-right">
                                                    {u.role !== 'super_admin' && (
                                                        <button 
                                                            onClick={() => {
                                                                setDeleteUserModalData({ id: u.id, name: u.name });
                                                                setDeleteUserMessage("");
                                                            }} 
                                                            className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {currentTab === "Workspaces" && (
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="text-xs uppercase bg-white/[0.04] text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 rounded-tl-xl font-bold">ID</th>
                                            <th className="px-6 py-4 font-bold">Workspace Name</th>
                                            <th className="px-6 py-4 font-bold">Owner ID</th>
                                            <th className="px-6 py-4 rounded-tr-xl font-bold">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.workspaces.map((w: any) => (
                                            <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{w.id}</td>
                                                <td className="px-6 py-4 font-semibold text-white">{w.name}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{w.owner_id}</td>
                                                <td className="px-6 py-4">{new Date(w.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {currentTab === "Global Agents" && (
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="text-xs uppercase bg-white/[0.04] text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 rounded-tl-xl font-bold">Agent Name</th>
                                            <th className="px-6 py-4 font-bold">Status</th>
                                            <th className="px-6 py-4 font-bold">Model</th>
                                            <th className="px-6 py-4 rounded-tr-xl font-bold">Workspace ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.agents.map((a: any) => (
                                            <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-semibold text-white">{a.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md uppercase 
                                                        ${a.status.toLowerCase() === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                        {a.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{a.model_choice}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{a.workspace_id}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {currentTab === "Global Integrations" && (
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="text-xs uppercase bg-white/[0.04] text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 rounded-tl-xl font-bold">Provider</th>
                                            <th className="px-6 py-4 font-bold">Status</th>
                                            <th className="px-6 py-4 rounded-tr-xl font-bold">Workspace ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.integrations.map((i: any) => (
                                            <tr key={i.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-semibold text-white uppercase">{i.provider}</td>
                                                <td className="px-6 py-4">
                                                    {i.is_active ? 
                                                        <span className="text-emerald-400 font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Active</span> : 
                                                        <span className="text-slate-500 font-bold flex items-center gap-2"><XCircle className="w-4 h-4"/> Inactive</span>}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{i.workspace_id}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Approval Modal */}
            {approvalModalData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#050810] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setApprovalModalData(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                            <XCircle className="w-5 h-5" />
                        </button>
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                            Approve {approvalModalData.request_type === 'quota' ? "Quota" : "Access"} Request
                        </h2>
                        <p className="text-slate-400 mb-8 text-sm">
                            Configure settings before approving {approvalModalData.name}'s request.
                        </p>
                        <form onSubmit={handleConfirmApproval} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Max Agents Allowed</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={approvalMaxAgents}
                                    onChange={e => setApprovalMaxAgents(Number(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message (Optional)</label>
                                <textarea
                                    value={approvalMessage}
                                    onChange={e => setApprovalMessage(e.target.value)}
                                    placeholder="Add a welcome note or quota explanation..."
                                    className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="mt-2 w-full px-5 py-3.5 rounded-xl bg-white text-black font-bold text-sm shadow-lg hover:bg-slate-200 hover:-translate-y-0.5 transition-all"
                            >
                                Confirm & Approve
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete User Modal */}
            {deleteUserModalData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#050810] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setDeleteUserModalData(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                            <XCircle className="w-5 h-5" />
                        </button>
                        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                            Delete Account
                        </h2>
                        <p className="text-slate-400 mb-8 text-sm">
                            You are about to permanently delete <strong className="text-white">{deleteUserModalData.name}</strong>'s account. They will be notified via email.
                        </p>
                        <form onSubmit={handleConfirmDeleteUser} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reason for Deletion</label>
                                <textarea
                                    value={deleteUserMessage}
                                    onChange={e => setDeleteUserMessage(e.target.value)}
                                    placeholder="Please explain why their account is being removed..."
                                    className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="mt-2 w-full px-5 py-3.5 rounded-xl bg-rose-500 text-white font-bold text-sm shadow-lg hover:bg-rose-600 hover:-translate-y-0.5 transition-all"
                            >
                                Delete User Permanently
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
