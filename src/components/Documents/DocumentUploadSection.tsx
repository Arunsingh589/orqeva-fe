"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, CloudUpload, FileText, Plus, X, AlertCircle } from "lucide-react";
import { uploadPDF } from "@/services/api";
import DocumentList from "./DocumentList";

interface DocumentUploadSectionProps {
    selectedDocument: string | null;
    onSelect: (document: string | null) => void;
    refreshKey: number;
    onUploadSuccess: () => void;
    agents: any[];
}

const MAX_FILE_SIZE_MB = 10;

export default function DocumentUploadSection({
    selectedDocument,
    onSelect,
    refreshKey,
    onUploadSuccess,
    agents,
}: DocumentUploadSectionProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [assignedAgent, setAssignedAgent] = useState<string>("global");
    const [isDragActive, setIsDragActive] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const dragCounter = useRef(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Close modal on Escape
    useEffect(() => {
        if (!isUploadModalOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isUploading) closeModal();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isUploadModalOpen, isUploading]);

    const closeModal = () => {
        setIsUploadModalOpen(false);
        setFileError(null);
        setIsDragActive(false);
        dragCounter.current = 0;
    };

    const validateFile = (file: File): string | null => {
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            return "Only PDF files are supported.";
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return `File exceeds the ${MAX_FILE_SIZE_MB}MB limit.`;
        }
        return null;
    };

    const processFile = useCallback(
        async (file: File) => {
            const error = validateFile(file);
            if (error) {
                setFileError(error);
                return;
            }
            setFileError(null);
            try {
                setIsUploading(true);
                const agentId = assignedAgent === "global" ? undefined : assignedAgent;
                await uploadPDF(file, agentId);
                onUploadSuccess();
                closeModal();
                showToast(`"${file.name}" uploaded successfully.`);
            } catch (error) {
                console.error(error);
                showToast("Upload failed. Please try again.", "error");
            } finally {
                setIsUploading(false);
            }
        },
        [assignedAgent, onUploadSuccess]
    );

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;
        const file = event.target.files[0];
        await processFile(file);
        event.target.value = ""; // reset input
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer.items?.length) setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            setIsDragActive(false);
            dragCounter.current = 0;
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragActive(false);
        if (isUploading) return;
        const file = e.dataTransfer.files?.[0];
        if (file) await processFile(file);
    };

    const selectedAgentLabel =
        assignedAgent === "global" ? "Global Knowledge Base" : agents.find((a) => a.id === assignedAgent)?.name ?? "Select agent";

    return (
        <div className="flex flex-col w-full text-white">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8 animate-[fadeIn_0.3s_ease-out]">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1.5 tracking-tight">Knowledge Base</h1>
                    <p className="text-slate-400 text-[15px]">Manage vector embeddings and contextual documents for RAG retrieval.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-[#FF8A3D] hover:bg-[#E67E22] active:scale-[0.97] transition-all duration-150 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-[#FF8A3D]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f19] cursor-pointer"
                >
                    <Plus className="w-5 h-5" strokeWidth={2.25} />
                    Upload Document
                </button>
            </div>

            {/* Documents List */}
            <div className="w-full h-full animate-[fadeIn_0.3s_ease-out]">
                <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-8 shadow-xl min-h-[500px] flex flex-col">
                    <DocumentList selectedDocument={selectedDocument} onSelect={onSelect} refreshKey={refreshKey} />
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="upload-modal-title"
                    onClick={() => !isUploading && closeModal()}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                            <h2 id="upload-modal-title" className="text-xl font-bold text-white">
                                Upload Knowledge
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-white transition-colors rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                disabled={isUploading}
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="p-8 flex flex-col items-center">
                            <p className="text-slate-400 text-center max-w-sm mb-6 text-sm leading-relaxed">
                                Add PDF guidelines, rulebooks, or company data so your agents can retrieve accurate, sourced answers.
                            </p>

                            {/* Agent assignment */}
                            <div className="w-full mb-6">
                                <label htmlFor="agent-select" className="block text-sm font-medium text-slate-300 mb-2">
                                    Assign to agent <span className="text-slate-500 font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="agent-select"
                                        value={assignedAgent}
                                        onChange={(e) => setAssignedAgent(e.target.value)}
                                        disabled={isUploading}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white focus:outline-none focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D] transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="global">Global Knowledge Base</option>
                                        {agents.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} ({a.role})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">{selectedAgentLabel} will have access to this document.</p>
                            </div>

                            {/* Dropzone */}
                            <label
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 relative group ${isUploading
                                    ? "border-white/10 bg-black/20 cursor-not-allowed"
                                    : isDragActive
                                        ? "border-[#FF8A3D] bg-[#FF8A3D]/10 scale-[1.01]"
                                        : "border-[#FF8A3D]/30 bg-gradient-to-b from-white/[0.02] to-black/20 hover:border-[#FF8A3D]/60 hover:bg-[#FF8A3D]/5"
                                    }`}
                            >
                                {isUploading ? (
                                    <div className="flex flex-col items-center text-[#FF8A3D]">
                                        <svg className="h-8 w-8 animate-spin mb-3" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        <span className="font-medium text-sm">Uploading document…</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center transform transition-transform duration-200 group-hover:scale-[1.03]">
                                        <div className="w-12 h-12 bg-[#FF8A3D]/10 rounded-full flex items-center justify-center mb-3 ring-1 ring-white/5">
                                            {isDragActive ? (
                                                <FileText className="w-6 h-6 text-[#FF8A3D]" strokeWidth={1.75} />
                                            ) : (
                                                <CloudUpload className="w-6 h-6 text-[#FF8A3D]" strokeWidth={1.75} />
                                            )}
                                        </div>
                                        <span className="text-[15px] font-medium text-slate-200 mb-1">
                                            {isDragActive ? "Drop to upload" : "Click to browse or drag a PDF"}
                                        </span>
                                        <span className="text-xs text-slate-500">Maximum file size {MAX_FILE_SIZE_MB}MB</span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>

                            {fileError && (
                                <div className="flex items-center gap-2 text-rose-400 text-sm mt-4 w-full bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{fileError}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div
                    role="status"
                    className={`fixed bottom-6 right-6 max-w-sm px-5 py-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-[slideUp_0.3s_ease-out] z-[999] ${toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}
                >
                    {toast.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium text-sm leading-relaxed">{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-auto text-current/70 hover:text-current shrink-0" aria-label="Dismiss">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}