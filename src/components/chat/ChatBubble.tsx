"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
    role: "user" | "assistant";
    content: string;
};

export default function ChatBubble({
    role,
    content,
}: Props) {
    const isUser = role === "user";

    return (
        <div
            className={`flex mb-6 ${isUser ? "justify-end" : "justify-start"
                }`}
        >
            <div
                className={`max-w-3xl rounded-2xl px-5 py-4 shadow-sm ${isUser
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200"
                    }`}
            >
                <div className={`break-words w-full overflow-hidden ${isUser ? "text-white" : "text-gray-800"}`}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-[15px]">{children}</p>,
                            a: ({ href, children }) => <a href={href} className={`${isUser ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'} hover:underline font-medium transition-colors`} target="_blank" rel="noopener noreferrer">{children}</a>,
                            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed text-[15px]">{children}</li>,
                            blockquote: ({ children }) => <blockquote className={`border-l-4 pl-4 py-1 italic mb-4 ${isUser ? 'border-blue-300 text-blue-100 bg-blue-700/30' : 'border-gray-300 text-gray-600 bg-gray-50'}`}>{children}</blockquote>,
                            table: ({ children }) => <div className="overflow-x-auto mb-4 rounded-lg border max-w-full"><table className={`min-w-full divide-y ${isUser ? 'divide-blue-400 border-blue-400' : 'divide-gray-200 border-gray-200'}`}>{children}</table></div>,
                            thead: ({ children }) => <thead className={isUser ? 'bg-blue-500/50' : 'bg-gray-100/80'}>{children}</thead>,
                            tbody: ({ children }) => <tbody className={`divide-y divide-solid ${isUser ? 'divide-blue-400/50 bg-blue-600' : 'divide-gray-200 bg-white'}`}>{children}</tbody>,
                            tr: ({ children }) => <tr className={`${isUser ? 'hover:bg-blue-500/30' : 'hover:bg-gray-50'} transition-colors`}>{children}</tr>,
                            th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">{children}</th>,
                            td: ({ children }) => <td className="px-4 py-3 text-sm">{children}</td>,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            code({ inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                const language = match ? match[1] : "";

                                return !inline && match ? (
                                    <div className="rounded-xl overflow-hidden border border-gray-700/50 my-4 bg-[#282c34] shadow-md w-full">
                                        <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] text-gray-300 text-xs font-mono border-b border-gray-800 shadow-sm">
                                            <span className="uppercase tracking-wider font-semibold text-gray-400">{language || "text"}</span>
                                        </div>
                                        <div className="overflow-x-auto flex-1">
                                            <SyntaxHighlighter
                                                style={oneDark}
                                                language={language}
                                                PreTag="div"
                                                customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent', fontSize: '0.875rem', lineHeight: '1.6' }}
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, "")}
                                            </SyntaxHighlighter>
                                        </div>
                                    </div>
                                ) : (
                                    <code
                                        className={`${isUser ? 'bg-blue-700 text-blue-50 border-blue-600' : 'bg-gray-100 text-pink-600 border-gray-200'} rounded-md px-1.5 py-0.5 text-[0.85em] font-mono border`}
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}