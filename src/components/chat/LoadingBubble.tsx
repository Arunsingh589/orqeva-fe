"use client";

export default function LoadingBubble() {
    return (
        <div className="flex justify-start mb-6">
            <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm">
                <div className="flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-150" />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-300" />
                </div>
            </div>
        </div>
    );
}