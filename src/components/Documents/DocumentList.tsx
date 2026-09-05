"use client"

import { deleteDocument, getDocuments } from "@/services/api";
import { useState, useEffect } from "react";


interface DocumentListProps {
    selectedDocument: string | null;
    onSelect: (document: string | null) => void;
    onClose?: () => void;
    refreshKey?: number;
}

function DocumentList({
    selectedDocument,
    onSelect,
    onClose,
    refreshKey
}: DocumentListProps) {

    const [documents, setDocuments] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState("");

    const loadDocuments = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getDocuments();
            setDocuments(data);

            if (
                selectedDocument && !data.includes(selectedDocument)
            ) {
                onSelect(null);
            }
        } catch (error) {
            setError("Failed to load documents")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
        loadDocuments()
    }, [refreshKey]);



    const handleDelete = async (filename: string) => {
        const confirmed = window.confirm(
            `Delete "${filename}"?`
        );
        if (!confirmed) return;

        try {
            setDeleting(filename);
            setError("");

            await deleteDocument(filename);

            setDocuments((prev) =>
                prev.filter((document) => document !== filename))
            if (selectedDocument === filename) {
                onSelect(null);
            }
        } catch (error) {
            setError("failed to delete document.");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="flex h-full flex-col">
            <div className="mb-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                        Uploaded Documents
                    </h2>

                    <div className="flex items-center gap-2">
                        <button onClick={loadDocuments}
                            className="text-xs text-[#FF8A3D] hover:text-[#E67E22] font-medium transition-colors bg-[#FF8A3D]/10 px-3 py-1.5 rounded-md border border-[#FF8A3D]/20 active:scale-95 cursor-pointer"
                        >
                            Refresh Index
                        </button>
                    </div>
                </div>
            </div>
            {
                loading && (
                    <p className="text-sm text-slate-400 animate-pulse mt-2">
                        Loading documents...
                    </p>
                )}
            {error && (
                <p className="mt-2 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                    {error}
                </p>
            )}
            <div className="space-y-3 mt-4">
                {
                    documents.map((document) => {
                        return (
                            <div
                                key={document}
                                className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0b0f19] px-5 py-4 transition-all hover:border-white/10 hover:bg-white/[0.02]"
                            >
                                <button
                                    onClick={() => onSelect(document)}
                                    className="flex min-w-0 flex-1 items-center gap-3 text-left group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[#FF8A3D]/10 flex items-center justify-center border border-[#FF8A3D]/20 group-hover:bg-[#FF8A3D]/20 transition-colors">
                                        <svg className="w-5 h-5 text-[#FF8A3D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <span className="truncate text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                                        {document}
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleDelete(document)}
                                    disabled={deleting === document}
                                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-rose-500/0 text-rose-500/50 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 disabled:opacity-50 transition-all ml-4 cursor-pointer"
                                >
                                    {deleting === document ? "..." : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    )}
                                </button>
                            </div>
                        )
                    })
                }

            </div>
        </div>
    );
}

export default DocumentList;