"use client";

import React, { useState } from "react";
import { Space_Grotesk, IBM_Plex_Mono, Inter } from "next/font/google";
import { ArrowRight, ArrowLeft, Check, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { completeOnboarding } from "@/services/api";

// ─── Fonts (matches landing page type system) ───────────────────────────────
const display = Space_Grotesk({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    variable: "--font-display",
});
const mono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-mono",
});
const body = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-body",
});

interface OnboardingViewProps {
    onComplete: () => void;
    userName: string;
}

interface Step {
    id: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;
}

const STEPS: Step[] = [
    {
        id: "welcome",
        eyebrow: "Step 1 · Overview",
        title: "Welcome to Orqeva™,",
        subtitle: "let's get you set up.",
        description:
            "Every agent you build here is grounded in your own knowledge, routed across models, and ready to deploy. Three quick steps and you're in.",
    },
    {
        id: "routing",
        eyebrow: "Step 2 · Intelligence",
        title: "Your agents route",
        subtitle: "across every model.",
        description:
            "Connect a knowledge base and Orqeva™ scores each request against speed, cost, and quality — picking the model that fits, every time.",
    },
    {
        id: "deploy",
        eyebrow: "Step 3 · Go live",
        title: "Ship with one",
        subtitle: "script tag.",
        description:
            "Your workspace is already provisioned. Create your first agent from the sidebar, then drop a single embed script into any site.",
    },
];

// ─── Shared card chrome (label + bordered panel) ────────────────────────────
function DiagramCard({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="w-full rounded-2xl border border-white/[0.08] bg-[#111317] p-6">
            <p
                className="text-[10px] uppercase text-[#5F6167] mb-5"
                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.14em" }}
            >
                {label}
            </p>
            {children}
        </div>
    );
}

// ─── Step 1 — orbit map: three capabilities orbiting one agent ─────────────
function OrbitMap() {
    const cx = 150;
    const cy = 128;
    const satellites = [
        { label: "KNOWLEDGE", angle: -90, radius: 60 },
        { label: "ROUTING", angle: 25, radius: 96 },
        { label: "DEPLOY", angle: 155, radius: 126 },
    ];
    const toPoint = (angleDeg: number, r: number) => {
        const rad = (angleDeg * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    return (
        <DiagramCard label="Three pieces, one agent">
            <svg
                viewBox="0 0 300 250"
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label="Diagram: knowledge, routing, and deploy each orbit and connect into a central agent"
            >
                {[60, 96, 126].map((r) => (
                    <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#20222A" strokeWidth="1" strokeDasharray="2 6" />
                ))}

                <circle cx={cx} cy={cy} r="30" fill="#171310" stroke="#FF8A3D" strokeWidth="1.5" />
                <text x={cx} y={cy - 3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="#FF8A3D" fontWeight={500}>
                    YOUR
                </text>
                <text x={cx} y={cy + 9} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="#FF8A3D" fontWeight={500}>
                    AGENT
                </text>

                {satellites.map((s, i) => {
                    const p = toPoint(s.angle, s.radius);
                    const labelAbove = p.y < cy;
                    return (
                        <g key={s.label}>
                            <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#2A2D33" strokeWidth="1" />
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                fill="#FF8A3D"
                                className="onboard-pulse"
                                style={{ animationDelay: `${i * 0.4}s` }}
                            />
                            <text
                                x={p.x}
                                y={labelAbove ? p.y - 14 : p.y + 20}
                                textAnchor="middle"
                                fontFamily="var(--font-mono)"
                                fontSize="8"
                                fill="#8F9096"
                            >
                                {s.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </DiagramCard>
    );
}

// ─── Step 2 — radar chart: model trade-offs across three axes ──────────────
function ModelRadarChart() {
    const cx = 150;
    const cy = 118;
    const maxR = 82;
    const axes = [
        { label: "SPEED", angle: -90 },
        { label: "QUALITY", angle: 30 },
        { label: "COST FIT", angle: 150 },
    ];
    const series = [
        { name: "GPT-4o", color: "#FF8A3D", values: [0.5, 0.95, 0.4] },
        { name: "Groq", color: "#8B8D93", values: [0.95, 0.55, 0.85] },
    ];
    const toPoint = (angleDeg: number, r: number) => {
        const rad = (angleDeg * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    return (
        <DiagramCard label="Model trade-offs">
            <svg
                viewBox="0 0 300 230"
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label="Radar chart comparing GPT-4o and Groq across speed, quality, and cost fit"
            >
                {[0.33, 0.66, 1].map((f) => {
                    const pts = axes.map((a) => toPoint(a.angle, maxR * f));
                    return (
                        <polygon
                            key={f}
                            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                            fill="none"
                            stroke="#20222A"
                            strokeWidth="1"
                        />
                    );
                })}

                {axes.map((a) => {
                    const p = toPoint(a.angle, maxR);
                    return <line key={a.label} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#2A2D33" strokeWidth="1" />;
                })}

                {series.map((s) => {
                    const pts = s.values.map((v, i) => toPoint(axes[i].angle, maxR * v));
                    return (
                        <polygon
                            key={s.name}
                            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                            fill={s.color}
                            fillOpacity="0.14"
                            stroke={s.color}
                            strokeWidth="1.5"
                        />
                    );
                })}

                {series.flatMap((s) =>
                    s.values.map((v, i) => {
                        const p = toPoint(axes[i].angle, maxR * v);
                        return <circle key={`${s.name}-${i}`} cx={p.x} cy={p.y} r="2.5" fill={s.color} />;
                    })
                )}

                {axes.map((a) => {
                    const p = toPoint(a.angle, maxR + 26);
                    return (
                        <text
                            key={a.label}
                            x={p.x}
                            y={p.y}
                            textAnchor="middle"
                            fontFamily="var(--font-mono)"
                            fontSize="8"
                            fill="#8F9096"
                        >
                            {a.label}
                        </text>
                    );
                })}
            </svg>

            <div className="flex items-center gap-5 mt-1">
                {series.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                        <span className="text-[11px] text-[#8B8D93]" style={{ fontFamily: "var(--font-mono)" }}>
                            {s.name}
                        </span>
                    </div>
                ))}
            </div>
        </DiagramCard>
    );
}

// ─── Step 3 — radial readiness gauge + live signal line ────────────────────
function ReadinessGauge() {
    const size = 148;
    const stroke = 9;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const checklist = ["Workspace created", "Default agent ready", "Embed script generated"];

    return (
        <DiagramCard label="Launch readiness">
            <div className="flex items-center gap-8">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="shrink-0"
                    role="img"
                    aria-label="Gauge showing 100 percent launch readiness"
                >
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1D1F25" strokeWidth={stroke} />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke="#FF8A3D"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={0}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                    <text x="50%" y="46%" textAnchor="middle" fontFamily="var(--font-display)" fontSize="24" fontWeight={600} fill="#ECEAE4">
                        100%
                    </text>
                    <text x="50%" y="63%" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#5F6167">
                        READY
                    </text>
                </svg>

                <ul className="space-y-3">
                    {checklist.map((item) => (
                        <li key={item} className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 shrink-0">
                                <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                            </span>
                            <span className="text-[13px] text-[#ECEAE4]">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </DiagramCard>
    );
}

function LiveSignalLine() {
    const path = "M0,40 L44,40 L58,12 L72,68 L86,22 L100,40 L400,40";
    return (
        <DiagramCard label="Going live">
            <svg
                viewBox="0 0 400 80"
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label="A signal pulse settling into a steady live line, representing the agent going live"
            >
                <path d={path} fill="none" stroke="#FF8A3D" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
                <circle className="onboard-pulse" cx="392" cy="40" r="4" fill="#FF8A3D" />
                <text x="326" y="24" fontFamily="var(--font-mono)" fontSize="9" fill="#5F6167" letterSpacing="1">
                    LIVE
                </text>
            </svg>
        </DiagramCard>
    );
}

function DeployVisual() {
    return (
        <div className="flex flex-col gap-5">
            <ReadinessGauge />
            <LiveSignalLine />
        </div>
    );
}

export default function OnboardingView({ onComplete, userName }: OnboardingViewProps) {
    const [step, setStep] = useState(1);
    const [isCompleting, setIsCompleting] = useState(false);
    const [transitionStep, setTransitionStep] = useState<"none" | "loading" | "fade">("none");
    const [loadingText, setLoadingText] = useState("INITIALIZING ROUTING LOGIC...");

    const handleNext = () => setStep((s) => Math.min(s + 1, 3));
    const handleBack = () => setStep((s) => Math.max(s - 1, 1));

    const handleFinish = async () => {
        setIsCompleting(true);
        try {
            const token = localStorage.getItem("token");
            if (token) {
                await completeOnboarding(token);
            }
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                user.has_completed_onboarding = true;
                localStorage.setItem("user", JSON.stringify(user));
            }

            // Start Premium Transition Sequence
            setTransitionStep("loading");
            setTimeout(() => setLoadingText("DEPLOYING DEFAULT AGENT..."), 800);
            setTimeout(() => setLoadingText("WORKSPACE READY"), 1800);

            await new Promise(resolve => setTimeout(resolve, 2500));
            setTransitionStep("fade");
            await new Promise(resolve => setTimeout(resolve, 600));

            onComplete();
        } catch (e) {
            console.error("Failed to complete onboarding:", e);
            setIsCompleting(false);
        }
    };

    const current = STEPS[step - 1];

    const renderVisual = () => {
        if (step === 1) return <OrbitMap />;
        if (step === 2) return <ModelRadarChart />;
        return <DeployVisual />;
    };

    return (
        <div
            className={cn(
                display.variable,
                mono.variable,
                body.variable,
                "fixed inset-0 z-[100] flex flex-col bg-[#0A0B0C] text-[#ECEAE4] overflow-y-auto transition-opacity duration-700",
                transitionStep === "fade" ? "opacity-0" : "opacity-100"
            )}
            style={{ fontFamily: "var(--font-body)" }}
        >
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        @keyframes onboard-signal-pulse {
                            0%, 100% { opacity: .35; r: 3; }
                            50% { opacity: 1; r: 4; }
                        }
                        @keyframes onboard-fade-in {
                            from { transform: translateY(10px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                        @media (prefers-reduced-motion: no-preference) {
                            .onboard-pulse { animation: onboard-signal-pulse 2.4s ease-in-out infinite; }
                            .onboard-live-dot { animation: onboard-signal-pulse 2s ease-in-out infinite; }
                        }
                        .onboard-panel { animation: onboard-fade-in .5s cubic-bezier(0.16,1,0.3,1); }
                    `,
                }}
            />

            {transitionStep === "none" ? (
                <>
                    {/* Top bar — brand mark + progress */}
                    <div className="w-full border-b border-white/[0.06]">
                        <div className="max-w-5xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="onboard-live-dot absolute inline-flex h-full w-full rounded-full bg-[#FF8A3D]" />
                                </span>
                                <span
                                    className="text-[13px] font-semibold uppercase"
                                    style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.18em" }}
                                >
                                    Orqeva™
                                </span>
                            </div>
                            <span className="text-[11px] text-[#5F6167]" style={{ fontFamily: "var(--font-mono)" }}>
                                {step} / {STEPS.length}
                            </span>
                        </div>
                        <div className="h-px w-full bg-white/[0.06]">
                            <div
                                className="h-full bg-[#FF8A3D] transition-all duration-500 ease-out"
                                style={{ width: `${(step / STEPS.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 flex items-center">
                        <div className="max-w-5xl w-full mx-auto px-6 lg:px-8 py-16">
                            <div key={current.id} className="onboard-panel grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                                {/* Copy */}
                                <div>
                                    <div
                                        className="inline-flex items-center gap-2 mb-6 text-[11px] uppercase text-[#FF8A3D]"
                                        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.16em" }}
                                    >
                                        <span className="w-1 h-1 rounded-full bg-[#FF8A3D]" />
                                        {current.eyebrow}
                                    </div>
                                    <h1
                                        className="font-semibold mb-6 leading-[1.1] text-3xl sm:text-4xl"
                                        style={{ fontFamily: "var(--font-display)" }}
                                    >
                                        <span>{step === 1 ? `${current.title} ${userName || "Creator"},` : current.title}</span>
                                        <br />
                                        <span className="text-[#5F6167]">{current.subtitle}</span>
                                    </h1>
                                    <p className="text-[#8B8D93] leading-relaxed mb-10 text-base sm:text-lg max-w-md">
                                        {current.description}
                                    </p>

                                    <div className="flex items-center gap-3">
                                        {step > 1 && (
                                            <button
                                                onClick={handleBack}
                                                disabled={isCompleting}
                                                className="cursor-pointer px-5 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-[#ECEAE4] rounded-lg text-sm font-medium transition-colors border border-white/[0.08] disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                        )}

                                        {step < 3 ? (
                                            <button
                                                onClick={handleNext}
                                                className="group cursor-pointer px-6 py-3 bg-[#ECEAE4] hover:bg-white text-[#0A0B0C] rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                                            >
                                                Continue
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleFinish}
                                                disabled={isCompleting}
                                                className="group cursor-pointer px-6 py-3 bg-[#FF8A3D] hover:bg-[#E67E22] disabled:opacity-60 text-[#0A0B0C] rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                                            >
                                                {isCompleting ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            />
                                                        </svg>
                                                        Setting up
                                                    </>
                                                ) : (
                                                    <>
                                                        Enter dashboard
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Diagram */}
                                <div>{renderVisual()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Step indicators */}
                    <div className="pb-10 flex justify-center gap-3">
                        {STEPS.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => !isCompleting && setStep(i + 1)}
                                aria-label={`Go to step ${i + 1}`}
                                disabled={isCompleting}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500 cursor-pointer disabled:cursor-not-allowed",
                                    step === i + 1 ? "w-8 bg-[#FF8A3D]" : "w-2 bg-white/[0.15] hover:bg-white/[0.3]"
                                )}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center animate-[onboard-fade-in_0.6s_cubic-bezier(0.16,1,0.3,1)]">
                    <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-white/[0.05]" />
                        <div className="absolute inset-0 rounded-full border-2 border-[#FF8A3D] border-t-transparent border-r-transparent animate-[spin_1.5s_linear_infinite]" />
                        <div className="absolute inset-0 rounded-full border-2 border-[#E67E22]/50 border-b-transparent border-l-transparent animate-[spin_2s_linear_infinite_reverse]" />
                        <Bot className="w-6 h-6 text-white ml-0.5 mt-0.5 drop-shadow-[0_0_10px_rgba(255,138,61,0.8)]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                        Provisioning Workspace
                    </h2>
                    <p
                        key={loadingText}
                        className="text-[#FF8A3D] text-[11px] font-semibold animate-[onboard-fade-in_0.3s_ease-out]"
                        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
                    >
                        {loadingText}
                    </p>
                </div>
            )}
        </div>
    );
}