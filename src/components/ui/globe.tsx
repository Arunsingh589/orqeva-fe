"use client";

import React from "react";

export default function Globe() {
    return (
        <div className="relative w-[500px] h-[500px] flex items-center justify-center">
            {/* Outer glow ring */}
            <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl animate-pulse" />

            {/* Main globe sphere */}
            <div
                className="relative w-[320px] h-[320px] rounded-full overflow-hidden"
                style={{
                    background: "radial-gradient(circle at 35% 35%, #1e1b4b 0%, #0f0a2e 40%, #050510 80%)",
                    boxShadow: `
            inset -40px -30px 60px rgba(0, 0, 0, 0.8),
            inset 20px 20px 40px rgba(99, 102, 241, 0.15),
            0 0 80px rgba(99, 102, 241, 0.15),
            0 0 120px rgba(139, 92, 246, 0.1)
          `,
                }}
            >
                {/* Latitude lines */}
                {[20, 35, 50, 65, 80].map((top, i) => (
                    <div
                        key={`lat-${i}`}
                        className="absolute left-1/2 -translate-x-1/2 rounded-full border border-indigo-400/[0.08]"
                        style={{
                            top: `${top}%`,
                            width: `${Math.sin((top / 100) * Math.PI) * 100}%`,
                            height: "1px",
                        }}
                    />
                ))}

                {/* Longitude arcs - animated rotation */}
                <div
                    className="absolute inset-0 animate-[globeSpin_25s_linear_infinite]"
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {[0, 30, 60, 90, 120, 150].map((deg, i) => (
                        <div
                            key={`lng-${i}`}
                            className="absolute inset-[10%] rounded-full border border-indigo-400/[0.07]"
                            style={{
                                transform: `rotateY(${deg}deg)`,
                                transformStyle: "preserve-3d",
                            }}
                        />
                    ))}
                </div>

                {/* Glowing dots representing cities/nodes */}
                {[
                    { top: "25%", left: "40%", delay: "0s", size: "6px" },
                    { top: "45%", left: "65%", delay: "1s", size: "5px" },
                    { top: "60%", left: "30%", delay: "2s", size: "4px" },
                    { top: "35%", left: "70%", delay: "0.5s", size: "5px" },
                    { top: "55%", left: "50%", delay: "1.5s", size: "6px" },
                    { top: "30%", left: "55%", delay: "3s", size: "4px" },
                    { top: "70%", left: "45%", delay: "2.5s", size: "3px" },
                    { top: "40%", left: "35%", delay: "0.8s", size: "5px" },
                ].map((dot, i) => (
                    <div
                        key={`dot-${i}`}
                        className="absolute rounded-full animate-pulse"
                        style={{
                            top: dot.top,
                            left: dot.left,
                            width: dot.size,
                            height: dot.size,
                            background: "radial-gradient(circle, #818cf8, #6366f1)",
                            boxShadow: "0 0 8px #818cf8, 0 0 16px rgba(129, 140, 248, 0.4)",
                            animationDelay: dot.delay,
                            animationDuration: "3s",
                        }}
                    />
                ))}

                {/* Connection lines between nodes */}
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 320 320">
                    <line x1="128" y1="80" x2="208" y2="144" stroke="url(#lineGrad)" strokeWidth="0.5" />
                    <line x1="208" y1="144" x2="96" y2="192" stroke="url(#lineGrad)" strokeWidth="0.5" />
                    <line x1="96" y1="192" x2="160" y2="176" stroke="url(#lineGrad)" strokeWidth="0.5" />
                    <line x1="160" y1="176" x2="224" y2="112" stroke="url(#lineGrad)" strokeWidth="0.5" />
                    <line x1="128" y1="80" x2="176" y2="96" stroke="url(#lineGrad)" strokeWidth="0.5" />
                    <defs>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Atmospheric highlight */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: "radial-gradient(circle at 30% 25%, rgba(129, 140, 248, 0.12) 0%, transparent 50%)",
                    }}
                />

                {/* Edge atmosphere glow */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: "radial-gradient(circle at 50% 50%, transparent 45%, rgba(99, 102, 241, 0.08) 65%, rgba(139, 92, 246, 0.04) 80%, transparent 100%)",
                    }}
                />
            </div>

            {/* Orbiting particle ring */}
            <div className="absolute w-[380px] h-[380px] rounded-full border border-indigo-500/[0.06] animate-[globeSpin_35s_linear_infinite_reverse]">
                <div
                    className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-indigo-400/60"
                    style={{ boxShadow: "0 0 10px #818cf8" }}
                />
                <div
                    className="absolute -bottom-1 left-1/3 w-1.5 h-1.5 rounded-full bg-purple-400/40"
                    style={{ boxShadow: "0 0 8px #a78bfa" }}
                />
            </div>
        </div>
    );
}
