"use client";

import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import LoadingBubble from "./LoadingBubble";

export type Message = {
    role: "user" | "assistant";
    content: string;
};

type Props = {
    messages: Message[];
    loading: boolean;
};

export default function ChatWindow({
    messages,
    loading,
}: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    return (
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-gray-50 p-6">
            {messages.map((message, index) => (
                <ChatBubble
                    key={index}
                    role={message.role}
                    content={message.content}
                />
            ))}

            {loading && <LoadingBubble />}

            <div ref={bottomRef} />
        </div>
    );
}