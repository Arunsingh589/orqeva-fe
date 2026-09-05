"use client";

import { useState, useRef, useEffect } from "react";
import { askQuestion, askQuestionStream } from "@/services/api";
import ChatInput from "./ChatInput";
import { ChatMessage } from "@/app/types/chat";
import Message from "./Message";

interface ChatSectionProps {
    agentId?: string;
    selectedDocument: string | null;
}

export default function ChatSection({ selectedDocument, agentId }: ChatSectionProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([{
        role: "assistant",
        content: "Hello! I am an assistant here to help you with any questions or guidance you may need related to the specific documents you have in your Knowledge Base. How can I assist you today?"
    }]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [sessionId, setSessionId] = useState<string>("");

    useEffect(() => {
        setSessionId(crypto.randomUUID());
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, loading]);

    const handleSend = async (question: string) => {
        const userMessage: ChatMessage = { role: "user", content: question };
        const updatedHistory = [...messages, userMessage];
        setMessages(updatedHistory);

        try {
            setLoading(true);
            const stream = askQuestionStream(question, updatedHistory, selectedDocument, agentId, sessionId);
            let finalContent = "";
            let firstChunk = true;
            for await (const chunk of stream) {
                finalContent += chunk;
                if (firstChunk) {
                    setLoading(false);
                    firstChunk = false;
                    setMessages((prev) => [...prev, { role: "assistant", content: finalContent }]);
                } else {
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].content = finalContent;
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Something went wrong answering that — try asking again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-transparent w-full">
            {/* Message list */}
            <div
                ref={scrollRef}
                className="flex-1 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 py-5 scrollbar-thin scrollbar-thumb-white/10"
            >
                {messages.map((message, index) => (
                    <Message key={index} message={message} />
                ))}

                {loading && (
                    <div className="flex items-center gap-3 animate-[fadeIn_0.25s_ease-out]">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#121826] text-xs font-semibold text-white shadow-md">
                            A
                        </div>
                        <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-[#121826] border border-white/5 px-4 py-3 shadow-md h-12 w-16 justify-center">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="px-6 py-4 pb-8">
                <ChatInput onSend={handleSend} loading={loading} />
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}