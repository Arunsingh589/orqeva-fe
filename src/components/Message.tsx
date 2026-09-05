"use client";

import { ChatMessage } from "@/app/types/chat";
import ReactMarkdown from 'react-markdown';
import SourceList from "./Message/SourceList";

interface MessageProps {
    message: ChatMessage;
}

export default function Message({ message }: MessageProps) {
    const isUser = message.role === "user";

    return (
        <div className={`flex gap-4 animate-[fadeIn_0.25s_ease-out] w-full ${isUser ? "flex-row-reverse" : ""}`}>
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-md ${isUser
                    ? "bg-indigo-600 text-white"
                    : "bg-[#8b5cf6] text-white"
                    }`}
            >
                {isUser ? "U" : "A"}
            </div>

            <div
                className={`max-w-[80%] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${isUser
                    ? "bg-[#6d28d9]/20 text-white rounded-2xl rounded-tr-sm border border-[#6d28d9]/30"
                    : "bg-[#121826] text-slate-200 rounded-2xl rounded-tl-sm border border-white/5"
                    }`}
            >
                {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <div className="text-[15px] leading-relaxed">
                        <ReactMarkdown
                            components={{
                                a: ({ node, ...props }) => <a {...props} className="text-indigo-400 hover:text-indigo-300 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" />,
                                p: ({ node, ...props }) => <p {...props} className="mb-4 last:mb-0 leading-relaxed" />,
                                h3: ({ node, ...props }) => <h3 {...props} className="text-sm font-semibold text-slate-300 mt-6 mb-3 uppercase tracking-wider" />,
                                ul: ({ node, ...props }) => <ul {...props} className="space-y-2 my-4 pl-4" />,
                                ol: ({ node, ...props }) => <ol {...props} className="space-y-2 my-4 pl-4" />,
                                li: ({ node, ...props }) => <li {...props} className="text-slate-200" />,
                                strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-white" />
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}

                {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="mt-4 border-t border-white/10 pt-3">
                        <SourceList sources={message.sources} />
                    </div>
                )}
            </div>
        </div>
    );
}