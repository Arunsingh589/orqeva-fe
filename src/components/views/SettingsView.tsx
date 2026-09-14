import { fetchWithAuth } from "@/services/authFetch";
import { API_BASE_URL } from "@/services/api";
import React, { useState } from 'react';
import { Layout, Palette, Image as ImageIcon, CheckCircle2, AlertCircle, Camera, Shield, Key, User, Building, CreditCard, LogOut } from 'lucide-react';

export default function SettingsView({ user, setUser, showToast }: any) {
    const [activeTab, setActiveTab] = useState("Profile");
    const [removeWatermark, setRemoveWatermark] = useState(false);
    const [customBrandName, setCustomBrandName] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#8b5cf6");

    // Profile Settings State
    const [name, setName] = useState(user?.name || "");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Security Settings State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // --- Handlers ---

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/user/update_profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, name })
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                showToast("Profile updated successfully", "success");
                setUser(data.user);
            } else {
                showToast(data.message || "Failed to update profile", "error");
            }
        } catch (e) {
            showToast("Network error", "error");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/user/update_password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, current_password: currentPassword, new_password: newPassword })
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                showToast("Password updated successfully", "success");
                setCurrentPassword("");
                setNewPassword("");
            } else {
                showToast(data.message || "Failed to update password", "error");
            }
        } catch (e) {
            showToast("Network error", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("email", user?.email);

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/user/upload_avatar`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.status === "success") {
                const updatedUser = { ...user, avatar_url: data.avatar_url };
                setUser(updatedUser);
                showToast("Avatar updated successfully", "success");
            } else {
                showToast(data.message || "Failed to upload avatar", "error");
            }
        } catch (err) {
            showToast("Network error uploading avatar", "error");
        }
    };

    return (
        <main className="flex-1 flex flex-col min-w-0 bg-[#050810] h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-10 py-12 w-full h-full flex flex-col">
                <div className="mb-10 animate-[fadeIn_0.3s_ease-out]">
                    <h1 className="text-3xl font-bold text-white mb-2">Workspace Settings</h1>
                    <p className="text-slate-400">Manage your workspace preferences, white-label configs, and security.</p>
                </div>

                <div className="bg-[#0b0f19] border border-white/5 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[70vh] flex-1 animate-[fadeIn_0.4s_ease-out]">
                    <div className="w-full md:w-64 md:border-r border-b md:border-b-0 border-white/5 bg-black/20 p-4 flex md:flex-col gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <button onClick={() => setActiveTab("Profile")} className={`flex items-center gap-3 w-auto md:w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer font-medium whitespace-nowrap ${activeTab === 'Profile' ? 'bg-[#FF8A3D]/10 text-[#FF8A3D]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <User className={`w-4 h-4 ${activeTab === 'Profile' ? 'text-[#FF8A3D]' : 'text-slate-500'}`} /> Profile
                        </button>
                        <button onClick={() => setActiveTab("Security")} className={`flex items-center gap-3 w-auto md:w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer font-medium whitespace-nowrap ${activeTab === 'Security' ? 'bg-[#FF8A3D]/10 text-[#FF8A3D]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Shield className={`w-4 h-4 ${activeTab === 'Security' ? 'text-[#FF8A3D]' : 'text-slate-500'}`} /> Security
                        </button>

                        {(user?.role === "admin" || user?.role === "super_admin" || user?.can_manage_branding) && (
                            <button onClick={() => setActiveTab("Branding")} className={`flex items-center gap-3 w-auto md:w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer font-medium whitespace-nowrap ${activeTab === 'Branding' ? 'bg-[#FF8A3D]/10 text-[#FF8A3D]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <Palette className={`w-4 h-4 ${activeTab === 'Branding' ? 'text-[#FF8A3D]' : 'text-slate-500'}`} /> Widget Branding
                            </button>
                        )}
                        {user?.role === "super_admin" && (
                            <>
                                <button onClick={() => setActiveTab("Organization")} className={`flex items-center gap-3 w-auto md:w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer font-medium whitespace-nowrap ${activeTab === 'Organization' ? 'bg-[#FF8A3D]/10 text-[#FF8A3D]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <Building className={`w-4 h-4 ${activeTab === 'Organization' ? 'text-[#FF8A3D]' : 'text-slate-500'}`} /> Organization
                                </button>
                                <button onClick={() => setActiveTab("Billing")} className={`flex items-center gap-3 w-auto md:w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer font-medium whitespace-nowrap ${activeTab === 'Billing' ? 'bg-[#FF8A3D]/10 text-[#FF8A3D]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <CreditCard className={`w-4 h-4 ${activeTab === 'Billing' ? 'text-[#FF8A3D]' : 'text-slate-500'}`} /> Billing
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex-1 p-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                        {/* ───────────────────────────────────────────────────────── PROFILE TAB ───────────────────────────────────────────────────────── */}
                        {activeTab === "Profile" && (
                            <div className="animate-[fadeIn_0.2s_ease-out] w-full max-w-3xl">
                                <h2 className="text-xl font-bold text-white mb-8" style={{ fontFamily: "var(--font-display)" }}>Profile Settings</h2>

                                <form onSubmit={handleProfileUpdate} className="space-y-10">
                                    <div className="flex items-start gap-8">
                                        <div className="relative group cursor-pointer flex-shrink-0">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF8A3D]/20 to-[#E67E22]/20 border-2 border-white/10 overflow-hidden flex items-center justify-center shadow-lg group-hover:border-[#FF8A3D]/50 transition-colors">
                                                {user?.avatar_url ? (
                                                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl text-white font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF8A3D] text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#E67E22] transition-colors transform translate-x-1 translate-y-1">
                                                <Camera className="w-4 h-4" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                            </label>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center pt-2 space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                                                <div className="bg-black/30 border border-white/5 rounded-xl px-5 py-3.5 text-white/50 font-medium cursor-not-allowed">
                                                    {user?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full max-w-md bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all font-medium"
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-white/5">
                                        <button
                                            type="submit"
                                            disabled={isSavingProfile || !name}
                                            className="w-full sm:w-auto px-8 py-3 bg-[#FF8A3D] hover:bg-[#E67E22] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-[#FF8A3D]/20 transition-all active:scale-[0.98] cursor-pointer"
                                        >
                                            {isSavingProfile ? "Saving..." : "Save Profile Details"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}


                        {/* ───────────────────────────────────────────────────────── SECURITY TAB ───────────────────────────────────────────────────────── */}
                        {activeTab === "Security" && (
                            <div className="animate-[fadeIn_0.2s_ease-out] w-full max-w-3xl">
                                <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Security & Authentication</h2>
                                <p className="text-sm text-slate-400 mb-8">Manage your password and active sessions securely.</p>

                                <div className="space-y-8">
                                    {/* Password Card */}
                                    <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-[#FF8A3D]/10 rounded-lg">
                                                <Key className="w-5 h-5 text-[#FF8A3D]" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white">Change Password</h3>
                                                <p className="text-sm text-slate-400 mt-0.5">Ensure your account uses a long, random password.</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                                                <div className="relative">
                                                    <input
                                                        type="password"
                                                        required
                                                        value={currentPassword}
                                                        onChange={e => setCurrentPassword(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 border-transparent hover:border-white/20 text-white placeholder-white/20 focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all font-mono"
                                                        placeholder="••••••••"
                                                    />
                                                    <Key className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type="password"
                                                        required
                                                        value={newPassword}
                                                        onChange={e => setNewPassword(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 border-transparent hover:border-white/20 text-white placeholder-white/20 focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all font-mono"
                                                        placeholder="••••••••"
                                                    />
                                                    <Shield className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={isSaving || !currentPassword || !newPassword}
                                                    className="w-full px-8 py-3 bg-[#FF8A3D] hover:bg-[#E67E22] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-[#FF8A3D]/20 transition-all active:scale-[0.98]"
                                                >
                                                    {isSaving ? "Updating Security..." : "Choose New Password"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>


                                    {/* Sign Out Card */}
                                    <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                                <LogOut className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white">Session Management</h3>
                                                <p className="text-sm text-slate-400 mt-0.5">Log out of your current session on this device.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    localStorage.removeItem("user");
                                                    localStorage.removeItem("token");
                                                    window.location.href = "/";
                                                }}
                                                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-medium transition-all active:scale-[0.98] outline-none flex items-center gap-2 cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ───────────────────────────────────────────────────────── BRANDING TAB ───────────────────────────────────────────────────────── */}
                        {activeTab === "Branding" && (
                            <div className="animate-[fadeIn_0.2s_ease-out]">
                                <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Widget White-Labeling</h2>
                                <p className="text-sm text-slate-400 mb-8">Customize how your deployed widget appears to external users.</p>

                                <div className="space-y-8 w-full max-w-5xl">
                                    <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-base font-semibold text-white flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#FF8A3D]" /> Custom Agent Logo</h3>
                                                <p className="text-sm text-slate-400 mt-1">Replaces the default text avatar in the widget header.</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 border-dashed flex items-center justify-center text-slate-500 hover:text-white hover:border-[#FF8A3D] transition-colors cursor-pointer">
                                                <ImageIcon className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-6">
                                        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4"><Palette className="w-4 h-4 text-[#FF8A3D]" /> Primary App Color</h3>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                                            />
                                            <input
                                                type="text"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#FF8A3D] focus:outline-none"
                                            />
                                            <div className="ml-auto flex gap-2">
                                                <div className="w-6 h-6 rounded-full cursor-pointer bg-[#FF8A3D]" onClick={() => setPrimaryColor("#8b5cf6")}></div>
                                                <div className="w-6 h-6 rounded-full cursor-pointer bg-[#10b981]" onClick={() => setPrimaryColor("#10b981")}></div>
                                                <div className="w-6 h-6 rounded-full cursor-pointer bg-[#3b82f6]" onClick={() => setPrimaryColor("#3b82f6")}></div>
                                                <div className="w-6 h-6 rounded-full cursor-pointer bg-[#f43f5e]" onClick={() => setPrimaryColor("#f43f5e")}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`border ${removeWatermark ? 'border-[#FF8A3D]/30 bg-[#FF8A3D]/5' : 'border-white/5 bg-white/[0.02]'} rounded-2xl p-6 transition-colors`}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-base font-semibold text-white flex items-center gap-2"><Layout className="w-4 h-4 text-[#FF8A3D]" /> Remove Orqeva Watermark</h3>
                                                <p className="text-sm text-slate-400 mt-1 max-w-[85%]">Extinguishes the "Powered by Orqeva" footer across all deployed agents by default.</p>
                                                {!removeWatermark && (
                                                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg w-fit border border-amber-500/20"><AlertCircle className="w-3.5 h-3.5" /> Requires Pro Tier Access</div>
                                                )}
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={removeWatermark} onChange={() => setRemoveWatermark(!removeWatermark)} />
                                                <div className="w-11 h-6 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF8A3D] border border-white/10 peer-checked:border-[#FF8A3D]"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className={`border border-white/5 bg-white/[0.02] rounded-2xl p-6 mb-8 transition-opacity duration-300 ${!removeWatermark ? 'opacity-30 pointer-events-none grayscale blur-[0.5px]' : ''}`}>
                                        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-2"><Layout className="w-4 h-4 text-[#FF8A3D]" /> Custom Footer Brand Name</h3>
                                        <div className="flex flex-col gap-3">
                                            <label className="text-sm font-medium text-slate-400">Replaces 'Orqeva' in the bottom footer watermark on all widgets natively.</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Acme Corp"
                                                value={customBrandName}
                                                onChange={(e) => setCustomBrandName(e.target.value)}
                                                disabled={!removeWatermark}
                                                className="w-full max-w-sm bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all outline-none"
                                            />
                                        </div>
                                    </div>


                                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                                        <p className="text-xs text-slate-500">Widget updates instantly propagate to active script embeds.</p>
                                        <button className="px-6 py-2.5 bg-[#FF8A3D] hover:bg-[#7c3aed] text-white rounded-xl font-medium shadow-lg shadow-[#FF8A3D]/20 transition-all cursor-pointer flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Save Appearance
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ───────────────────────────────────────────────────────── ORG TAB ───────────────────────────────────────────────────────── */}
                        {(activeTab === "Organization" || activeTab === "Billing" || activeTab === "Notifications") && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-[fadeIn_0.2s_ease-out]">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                                    <Layout className="w-6 h-6 text-slate-400 opacity-50" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">Coming Soon</h3>
                                <p className="text-sm max-w-sm text-center">This section is currently under development. Enterprise and workspace-level configurations will be managed here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </main >
    );
}
