"use client";

import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/services/authFetch';
import { Bell, CheckCircle, Clock } from 'lucide-react';

import { API_BASE_URL } from "@/services/api";

export default function NotificationsView() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/workspace/requests`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleResolve = async (reqId: number) => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/workspace/requests/${reqId}/resolve`, {
                method: "POST"
            });
            if (res.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error("Failed to resolve request", error);
        }
    };

    return (
        <main className="flex-1 flex flex-col min-w-0 bg-[#050810] h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-10 py-12 max-w-5xl mx-auto w-full h-full flex flex-col">
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
                        Notification Center
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base max-w-2xl">
                        Manage requests and messages from your workspace members.
                    </p>
                </div>

                <div className="flex-1 space-y-4">
                    {isLoading ? (
                        <div className="text-center text-slate-500 py-12">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-white/5 bg-white/[0.02] rounded-3xl">
                            <Bell className="w-12 h-12 mb-4 opacity-50" />
                            <p>You have no notifications.</p>
                        </div>
                    ) : (
                        notifications.map((notif: any) => (
                            <div key={notif.id} className={`p-6 rounded-2xl border transition-all ${notif.status === 'pending' ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.02] border-white/5 opacity-60'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${notif.status === 'pending' ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                                            {notif.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">{notif.user_name} <span className="text-slate-400 font-normal text-sm ml-2">({notif.user_email})</span></h3>
                                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(notif.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${notif.status === 'pending' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {notif.status}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="bg-black/40 rounded-xl p-4 text-slate-300 text-sm mb-4 border border-white/5">
                                    {notif.message}
                                </div>

                                {notif.status === 'pending' && (
                                    <div className="flex justify-end gap-3">
                                        <button 
                                            onClick={() => handleResolve(notif.id)}
                                            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Mark as Resolved
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
