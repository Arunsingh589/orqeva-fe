"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
    onSend: (question: string) => void;
    loading: boolean;
}

function ChatInput({ onSend, loading }: ChatInputProps) {
    const [question, setQuestion] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if (!question.trim() || loading) return;
        onSend(question);
        setQuestion("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    return (
        <div className="flex items-center gap-3 bg-[#0b0f19] border border-white/5 shadow-inner p-2 pl-4 pr-3 rounded-2xl max-w-4xl mx-auto w-full transition-all focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50">
            <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Type a message..."
                value={question}
                onChange={handleInput}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
                className="max-h-[120px] flex-1 resize-none bg-transparent py-3 text-[15px] font-normal leading-relaxed text-slate-200 placeholder:text-slate-500 focus:outline-none scrollbar-thin scrollbar-thumb-white/10"
            />

            <button
                onClick={handleSubmit}
                disabled={loading || !question.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6] text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 shadow-md shadow-[#8b5cf6]/30 disabled:shadow-none"
                aria-label="Send message"
            >
                {loading ? (
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                ) : (
                    <Send className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={2.5} />
                )}
            </button>
        </div>
    );
}

export default ChatInput;