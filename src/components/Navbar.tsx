"use client";

import { useEffect, useState } from "react";

function Navbar() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsDark(document.documentElement.classList.contains("dark"));
        }
    }, []);

    const toggleTheme = () => {
        const root = document.documentElement;
        if (root.classList.contains("dark")) {
            root.classList.remove("dark");
            localStorage.theme = "light";
            setIsDark(false);
        } else {
            root.classList.add("dark");
            localStorage.theme = "dark";
            setIsDark(true);
        }
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-indigo-100/50 bg-white/70 backdrop-blur-xl dark:border-white/5 dark:bg-black/40 transition-colors duration-300">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-sm shadow-indigo-500/30">
                        <svg
                            className="h-4.5 w-4.5 text-white"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-white">
                        RAG Chat
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
                        Ask questions from your PDFs
                    </p>
                    <button
                        onClick={toggleTheme}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                        aria-label="Toggle theme"
                    >
                        {isDark ? (
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;