"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Space_Grotesk, IBM_Plex_Mono, Inter } from "next/font/google";
import Globe from "@/components/ui/globe";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";

// ─── Fonts (self-hosted, zero layout shift) ─────────────────────────────────
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

// ─── Types ───────────────────────────────────────────────────────────────────
interface ScrollGlobeSection {
    id: string;
    eyebrow: string;
    title: string;
    subtitle?: string;
    description: string;
    features?: { title: string; description: string }[];
    actions?: { label: string; variant: "primary" | "secondary"; href?: string; actionId?: string }[];
    readout?: { label: string; value: string }[];
    visual?: "routing" | "observability" | "deploy";
    distribution?: { name: string; pct: number }[];
    reverse?: boolean;
}

interface ScrollGlobeProps {
    sections: ScrollGlobeSection[];
    globeConfig?: {
        positions: { top: string; left: string; scale: number }[];
    };
    className?: string;
}

// ─── Globe positions per section ────────────────────────────────────────────
const defaultGlobeConfig = {
    positions: [
        { top: "48%", left: "50%", scale: 1.3 },
        { top: "28%", left: "82%", scale: 1.0 },
        { top: "70%", left: "18%", scale: 1.1 },
        { top: "30%", left: "82%", scale: 1.0 },
    ],
};

const parsePercent = (str: string): number => parseFloat(str.replace("%", ""));

// ─── Card shell (shared chrome for every diagram/chart) ─────────────────────
function DiagramCard({
    label,
    corner,
    children,
}: {
    label: string;
    corner?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0E0F13] p-6 sm:p-7">
            <div className="flex items-baseline justify-between mb-6">
                <p
                    className="text-[10px] uppercase text-[#5F6167]"
                    style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.14em" }}
                >
                    {label}
                </p>
                {corner}
            </div>
            {children}
        </div>
    );
}

// ─── Routing schematic ───────────────────────────────────────────────────────
// A request entering the router and being dispatched to one of several
// models before a response is returned — the actual routing behavior.
function RoutingSchematic() {
    const models = ["GPT-4o", "Groq", "OpenRouter"];
    return (
        <DiagramCard label="Request routing">
            <svg
                viewBox="0 0 560 190"
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label="Diagram: a request flows from input through the router to one of three models, then returns as a response"
            >
                <line x1="70" y1="95" x2="180" y2="95" stroke="#2A2D33" strokeWidth="1.5" />
                {models.map((_, i) => (
                    <line key={i} x1="220" y1="95" x2="380" y2={38 + i * 56} stroke="#2A2D33" strokeWidth="1.5" />
                ))}
                {models.map((_, i) => (
                    <line key={`out-${i}`} x1="470" y1={38 + i * 56} x2="510" y2="95" stroke="#2A2D33" strokeWidth="1.5" />
                ))}

                <g>
                    <rect x="10" y="75" width="60" height="40" rx="6" fill="#15171B" stroke="#33363C" />
                    <text x="40" y="99" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="#8F9096">
                        INPUT
                    </text>
                </g>

                <g>
                    <rect x="180" y="71" width="80" height="48" rx="6" fill="#171310" stroke="#FF8A3D" strokeWidth="1.25" />
                    <text x="220" y="92" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="#FF8A3D" fontWeight={500}>
                        ROUTER
                    </text>
                    <text x="220" y="106" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="#B0733F">
                        rules · cost · load
                    </text>
                </g>

                {models.map((m, i) => (
                    <g key={m}>
                        <rect x="380" y={18 + i * 56} width="90" height="40" rx="6" fill="#15171B" stroke="#33363C" />
                        <text x="425" y={42 + i * 56} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="#ECEAE4">
                            {m}
                        </text>
                        <circle
                            className="schematic-pulse"
                            cx="392"
                            cy={38 + i * 56}
                            r="3"
                            fill="#FF8A3D"
                            style={{ animationDelay: `${i * 0.5}s` }}
                        />
                    </g>
                ))}

                <g>
                    <rect x="510" y="75" width="50" height="40" rx="6" fill="#15171B" stroke="#33363C" />
                    <text x="535" y="99" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#8F9096">
                        OUT
                    </text>
                </g>
            </svg>
        </DiagramCard>
    );
}

// ─── Model distribution chart ───────────────────────────────────────────────
function ModelDistributionChart({ data }: { data: { name: string; pct: number }[] }) {
    return (
        <DiagramCard label="Request share · last 24h">
            <div
                role="img"
                aria-label={`Request share by model: ${data.map((d) => `${d.name} ${d.pct}%`).join(", ")}`}
                className="space-y-4"
            >
                {data.map((d) => (
                    <div key={d.name}>
                        <div className="flex items-baseline justify-between mb-1.5 text-[12px]" style={{ fontFamily: "var(--font-mono)" }}>
                            <span className="text-[#ECEAE4]">{d.name}</span>
                            <span className="text-[#8B8D93]">{d.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full bg-[#FF8A3D]" style={{ width: `${d.pct}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </DiagramCard>
    );
}

// ─── Request volume chart ────────────────────────────────────────────────────
function RequestVolumeChart() {
    const samples = [38, 41, 39, 46, 44, 52, 49, 58, 55, 64, 60, 69, 66, 74, 71, 80];
    const width = 560;
    const height = 170;
    const padX = 12;
    const padY = 16;
    const max = Math.max(...samples);
    const min = Math.min(...samples);
    const stepX = (width - padX * 2) / (samples.length - 1);
    const scaleY = (v: number) => height - padY - ((v - min) / (max - min)) * (height - padY * 2);

    const linePoints = samples.map((v, i) => `${padX + i * stepX},${scaleY(v)}`);
    const linePath = `M ${linePoints.join(" L ")}`;
    const areaPath = `${linePath} L ${padX + (samples.length - 1) * stepX},${height - padY} L ${padX},${height - padY} Z`;
    const lastX = padX + (samples.length - 1) * stepX;
    const lastY = scaleY(samples[samples.length - 1]);

    return (
        <DiagramCard
            label="Requests / min"
            corner={
                <p className="text-[13px] text-[#FF8A3D]" style={{ fontFamily: "var(--font-mono)" }}>
                    {samples[samples.length - 1]} now
                </p>
            }
        >
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label={`Requests per minute over the last ${samples.length} minutes, currently ${samples[samples.length - 1]} per minute and trending up`}
            >
                <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="#24262B" strokeWidth="1" />
                <path d={areaPath} fill="#FF8A3D" fillOpacity="0.08" stroke="none" />
                <path d={linePath} fill="none" stroke="#FF8A3D" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
                <circle className="schematic-pulse" cx={lastX} cy={lastY} r="3.5" fill="#FF8A3D" />
            </svg>
        </DiagramCard>
    );
}

// ─── Embed flow diagram ──────────────────────────────────────────────────────
// What actually happens when the widget script tag runs on a customer's site.
function EmbedFlowDiagram() {
    const steps = ["Your website", "<script> tag", "Orqeva™ widget", "Your agent"];
    return (
        <DiagramCard label="Embed flow">
            <svg
                viewBox="0 0 560 100"
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label={`Diagram: ${steps.join(" leads to ")}`}
            >
                {steps.map((_, i) =>
                    i < steps.length - 1 ? (
                        <line key={i} x1={12 + i * 140 + 118} y1="40" x2={12 + (i + 1) * 140} y2="40" stroke="#2A2D33" strokeWidth="1.5" />
                    ) : null
                )}
                {steps.map((label, i) => (
                    <g key={label}>
                        <rect
                            x={12 + i * 140}
                            y="20"
                            width="118"
                            height="40"
                            rx="6"
                            fill={i === 2 ? "#171310" : "#15171B"}
                            stroke={i === 2 ? "#FF8A3D" : "#33363C"}
                            strokeWidth={i === 2 ? 1.25 : 1}
                        />
                        <text
                            x={12 + i * 140 + 59}
                            y="44"
                            textAnchor="middle"
                            fontFamily="var(--font-mono)"
                            fontSize="9.5"
                            fill={i === 2 ? "#FF8A3D" : "#ECEAE4"}
                        >
                            {label}
                        </text>
                    </g>
                ))}
            </svg>
        </DiagramCard>
    );
}

// ─── Agent-on-website diagram ────────────────────────────────────────────────
// What "every call, measured" actually looks like: a visitor messages the
// embedded agent widget on the customer's site, and that exchange is logged.
function AgentOnWebsiteDiagram() {
    return (
        <DiagramCard label="Embedded agent · live">
            <svg
                viewBox="0 0 560 240"
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label="Diagram: a visitor's message to the embedded agent widget on a website is sent to Orqeva™ and logged with latency and status"
            >
                {/* browser frame */}
                <rect x="10" y="10" width="380" height="220" rx="10" fill="#111317" stroke="#2A2D33" />
                <rect x="10" y="10" width="380" height="32" rx="10" fill="#15171B" stroke="#2A2D33" />
                <rect x="10" y="26" width="380" height="16" fill="#15171B" />
                <circle cx="27" cy="26" r="3" fill="#33363C" />
                <circle cx="40" cy="26" r="3" fill="#33363C" />
                <circle cx="53" cy="26" r="3" fill="#33363C" />
                <rect x="80" y="18" width="220" height="16" rx="8" fill="#0E0F13" />
                <text x="94" y="29" fontFamily="var(--font-mono)" fontSize="8.5" fill="#5F6167">
                    yoursite.com
                </text>

                {/* page content placeholders */}
                <rect x="30" y="60" width="130" height="8" rx="2" fill="#24262B" />
                <rect x="30" y="80" width="220" height="6" rx="2" fill="#1B1D22" />
                <rect x="30" y="94" width="180" height="6" rx="2" fill="#1B1D22" />
                <rect x="30" y="108" width="200" height="6" rx="2" fill="#1B1D22" />

                {/* visitor message bubble */}
                <rect x="30" y="150" width="160" height="34" rx="9" fill="#1B1D22" stroke="#2A2D33" />
                <text x="44" y="164" fontFamily="var(--font-mono)" fontSize="8" fill="#8B8D93">
                    Visitor
                </text>
                <text x="44" y="176" fontFamily="var(--font-mono)" fontSize="8" fill="#5F6167">
                    "Do you ship to Delhi?"
                </text>

                {/* message path to agent widget */}
                <path d="M 190 175 L 300 195" fill="none" stroke="#2A2D33" strokeWidth="1.25" strokeDasharray="3 3" />

                {/* agent widget, bottom right of the browser */}
                <rect x="290" y="178" width="90" height="42" rx="10" fill="#171310" stroke="#FF8A3D" strokeWidth="1.25" />
                <circle className="schematic-pulse" cx="304" cy="192" r="3" fill="#FF8A3D" />
                <text x="316" y="196" fontFamily="var(--font-mono)" fontSize="9" fill="#FF8A3D" fontWeight={500}>
                    AGENT
                </text>
                <text x="304" y="210" fontFamily="var(--font-mono)" fontSize="7.5" fill="#B0733F">
                    embed.js
                </text>

                {/* connector out of the browser to the telemetry card */}
                <path d="M 380 199 L 430 199" fill="none" stroke="#2A2D33" strokeWidth="1.5" />

                {/* telemetry / logging card */}
                <rect x="430" y="150" width="120" height="80" rx="8" fill="#15171B" stroke="#33363C" />
                <text x="444" y="172" fontFamily="var(--font-mono)" fontSize="8" fill="#5F6167">
                    LOGGED CALL
                </text>
                <text x="444" y="192" fontFamily="var(--font-mono)" fontSize="10" fill="#ECEAE4">
                    142ms
                </text>
                <circle className="schematic-pulse" cx="444" cy="208" r="2.5" fill="#639922" />
                <text x="452" y="211" fontFamily="var(--font-mono)" fontSize="7.5" fill="#8B8D93">
                    200 OK
                </text>
            </svg>
        </DiagramCard>
    );
}

// ─── ScrollGlobe Component ──────────────────────────────────────────────────
function ScrollGlobe({ sections, globeConfig = defaultGlobeConfig, className }: ScrollGlobeProps) {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [globeTransform, setGlobeTransform] = useState("");
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 3000);
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);
    const animationFrameId = useRef<number | undefined>(undefined);

    const calculatedPositions = useMemo(
        () =>
            globeConfig.positions.map((pos) => ({
                top: parsePercent(pos.top),
                left: parsePercent(pos.left),
                scale: pos.scale,
            })),
        [globeConfig.positions]
    );

    const updateScrollPosition = useCallback(() => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
        setScrollProgress(progress);

        const viewportCenter = window.innerHeight / 2;
        let newActiveSection = 0;
        let minDistance = Infinity;

        sectionRefs.current.forEach((ref, index) => {
            if (!ref) return;
            const rect = ref.getBoundingClientRect();
            const sectionCenter = rect.top + rect.height / 2;
            const distance = Math.abs(sectionCenter - viewportCenter);
            if (distance < minDistance) {
                minDistance = distance;
                newActiveSection = index;
            }
        });

        const pos = calculatedPositions[newActiveSection];
        setGlobeTransform(
            `translate3d(${pos.left}vw, ${pos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${pos.scale}, ${pos.scale}, 1)`
        );
        setActiveSection(newActiveSection);
    }, [calculatedPositions]);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (ticking) return;
            ticking = true;
            animationFrameId.current = requestAnimationFrame(() => {
                updateScrollPosition();
                ticking = false;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        updateScrollPosition();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [updateScrollPosition]);

    useEffect(() => {
        const pos = calculatedPositions[0];
        setGlobeTransform(
            `translate3d(${pos.left}vw, ${pos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${pos.scale}, ${pos.scale}, 1)`
        );
    }, [calculatedPositions]);

    useEffect(() => {
        if (!isLoginOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsLoginOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isLoginOpen]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const res = await fetch("http://localhost:8000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok && data.status === "success") {
                localStorage.setItem("token", data.token);
                showToast("Signed in. Redirecting to your dashboard.", "success");
                window.setTimeout(() => router.push("/dashboard"), 1200);
            } else {
                showToast(data.message || "Those credentials didn't work.", "error");
                setIsLoggingIn(false);
            }
        } catch {
            showToast("Couldn't reach the server. Check your connection.", "error");
            setIsLoggingIn(false);
        }
    };

    const navItems = [
        { label: "Routing", index: 1 },
        { label: "Observability", index: 2 },
        { label: "Deploy", index: 3 },
    ];

    const renderVisual = (visual: ScrollGlobeSection["visual"], distribution?: { name: string; pct: number }[]) => {
        if (visual === "routing") {
            return (
                <div className="flex flex-col gap-6">
                    <RoutingSchematic />
                    {distribution && <ModelDistributionChart data={distribution} />}
                </div>
            );
        }
        if (visual === "observability") {
            return (
                <div className="flex flex-col gap-6">
                    <AgentOnWebsiteDiagram />
                    <RequestVolumeChart />
                </div>
            );
        }
        if (visual === "deploy") {
            return (
                <div className="flex flex-col gap-6">
                    <EmbedFlowDiagram />
                    <DiagramCard label="index.html">
                        <pre className="text-[13px] leading-relaxed overflow-x-auto text-[#ECEAE4]" style={{ fontFamily: "var(--font-mono)" }}>
                            {[
                                "<script",
                                '  src="https://cdn.orqeva.ai/widget.js"',
                                '  data-agent="YOUR_AGENT_ID"',
                                '  data-theme="brand"',
                                "></script>",
                            ].join("\n")}
                        </pre>
                    </DiagramCard>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                display.variable,
                mono.variable,
                body.variable,
                "relative w-full max-w-[100vw] overflow-x-hidden min-h-screen bg-[#0A0B0C] text-[#ECEAE4] tracking-tight",
                className
            )}
            style={{ fontFamily: "var(--font-body)" }}
        >
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        @keyframes signal-pulse {
                            0%, 100% { opacity: .35; r: 3; }
                            50% { opacity: 1; r: 4; }
                        }
                        @keyframes slide-up {
                            from { transform: translateY(12px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                        @media (prefers-reduced-motion: no-preference) {
                            .schematic-pulse { animation: signal-pulse 2.4s ease-in-out infinite; }
                            .live-dot { animation: signal-pulse 2s ease-in-out infinite; }
                        }
                        .toast-enter { animation: slide-up .35s cubic-bezier(0.16,1,0.3,1); }
                        .modal-enter { animation: slide-up .3s cubic-bezier(0.16,1,0.3,1); }
                    `,
                }}
            />

            {/* Nav */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-[#0A0B0C]/80 backdrop-blur-lg border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Bot className="w-5 h-5 text-[#FF8A3D]" />
                        <span className="text-[15px] font-semibold uppercase" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.18em" }}>
                            Orqeva™
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => sectionRefs.current[item.index]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                                className="cursor-pointer text-[13px] font-medium text-[#8B8D93] hover:text-[#ECEAE4] transition-colors focus-visible:outline-none focus-visible:text-[#ECEAE4]"
                                style={{ fontFamily: "var(--font-mono)" }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsLoginOpen(true)}
                        className="cursor-pointer px-4 py-2 bg-[#ECEAE4] hover:bg-white text-[#0A0B0C] rounded-md text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0C]"
                    >
                        Launch dashboard
                    </button>
                </div>
            </nav>

            {/* Progress bar */}
            <div className="fixed top-16 left-0 w-full h-px bg-white/[0.06] z-40">
                <div
                    className="h-full bg-[#FF8A3D]"
                    style={{ transform: `scaleX(${scrollProgress})`, transformOrigin: "left center", transition: "transform 0.1s linear" }}
                />
            </div>

            {/* Section dots */}
            <div className="hidden sm:flex fixed right-6 lg:right-10 top-1/2 -translate-y-1/2 z-40 flex-col gap-5">
                {sections.map((section, index) => (
                    <button
                        key={section.id}
                        onClick={() => sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                        aria-label={`Go to ${section.eyebrow} section`}
                        className="group relative flex items-center justify-end cursor-pointer"
                    >
                        <span
                            className={cn(
                                "mr-3 px-2.5 py-1 rounded text-[10px] whitespace-nowrap bg-[#111317] border border-white/[0.08]",
                                "opacity-0 group-hover:opacity-100 transition-opacity",
                                activeSection === index && "opacity-100"
                            )}
                            style={{ fontFamily: "var(--font-mono)", color: "#8B8D93" }}
                        >
                            {section.eyebrow}
                        </span>
                        <span
                            className={cn(
                                "block w-2 h-2 rounded-full border transition-all",
                                activeSection === index
                                    ? "bg-[#FF8A3D] border-[#FF8A3D]"
                                    : "bg-transparent border-[#3C3E44] group-hover:border-[#FF8A3D]/60"
                            )}
                        />
                    </button>
                ))}
            </div>

            {/* Globe */}
            <div
                className="fixed z-10 pointer-events-none will-change-transform transition-transform duration-[1100ms] ease-[cubic-bezier(0.25,1,0.35,1)]"
                style={{
                    transform: globeTransform,
                    opacity: activeSection === 0 ? 0.55 : 0.16,
                    filter: "saturate(0.7) sepia(0.15) hue-rotate(-10deg)",
                }}
            >
                <div className="scale-[0.8] sm:scale-100 lg:scale-[1.1]">
                    <Globe />
                </div>
            </div>

            {/* Login modal */}
            {isLoginOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="login-heading"
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && setIsLoginOpen(false)}
                >
                    <div className="modal-enter relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#111317] p-8">
                        <button
                            onClick={() => setIsLoginOpen(false)}
                            aria-label="Close"
                            className="cursor-pointer absolute top-5 right-5 text-[#8B8D93] hover:text-[#ECEAE4] transition-colors focus-visible:outline-none"
                        >
                            <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="mb-8">
                            <p className="text-[10px] uppercase text-[#FF8A3D] mb-2" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.15em" }}>
                                Authenticate
                            </p>
                            <h2 id="login-heading" className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                                Sign in to Orqeva™
                            </h2>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-[11px] font-medium text-[#8B8D93] mb-1.5">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0A0B0C] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-[#ECEAE4] placeholder-[#4A4C52] focus:outline-none focus:border-[#FF8A3D]/60 transition-colors"
                                    placeholder="name@company.com"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label htmlFor="password" className="block text-[11px] font-medium text-[#8B8D93]">
                                        Password
                                    </label>
                                    <a href="#" className="text-[11px] text-[#FF8A3D] hover:text-[#FFA867]">
                                        Forgot password?
                                    </a>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0A0B0C] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-[#ECEAE4] placeholder-[#4A4C52] focus:outline-none focus:border-[#FF8A3D]/60 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className={cn(
                                    "w-full mt-2 rounded-lg bg-[#ECEAE4] hover:bg-white disabled:opacity-60 text-[#0A0B0C] font-semibold text-sm py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111317]",
                                    isLoggingIn ? "cursor-not-allowed" : "cursor-pointer"
                                )}
                            >
                                {isLoggingIn ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Signing in
                                    </span>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Hero ────────────────────────────────────────────────────────── */}
            <section
                ref={(el) => {
                    sectionRefs.current[0] = el;
                }}
                className="relative min-h-screen flex items-center z-20 py-32"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="max-w-3xl mx-auto text-center">
                        <div
                            className="inline-flex items-center gap-2 mb-6 text-[11px] uppercase text-[#FF8A3D]"
                            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.16em" }}
                        >
                            <span className="w-1 h-1 rounded-full bg-[#FF8A3D]" />
                            {sections[0].eyebrow}
                        </div>
                        <h1
                            className="font-semibold mb-6 leading-[1.08] text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            <span>{sections[0].title}</span>
                            {sections[0].subtitle && (
                                <>
                                    <br />
                                    <span className="text-[#5F6167]">{sections[0].subtitle}</span>
                                </>
                            )}
                        </h1>
                        <p className="text-[#8B8D93] leading-relaxed mb-10 text-base sm:text-lg max-w-xl mx-auto">
                            {sections[0].description}
                        </p>
                        {sections[0].actions && (
                            <div className="flex flex-wrap gap-3 justify-center">
                                {sections[0].actions.map((action) =>
                                    action.actionId === "login" ? (
                                        <button
                                            key={action.label}
                                            onClick={() => setIsLoginOpen(true)}
                                            className={cn(
                                                "cursor-pointer px-6 py-3 rounded-lg font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0C]",
                                                action.variant === "primary"
                                                    ? "bg-[#ECEAE4] hover:bg-white text-[#0A0B0C]"
                                                    : "border border-white/[0.12] hover:border-white/[0.24] text-[#ECEAE4]"
                                            )}
                                        >
                                            {action.label}
                                        </button>
                                    ) : (
                                        <Link
                                            key={action.label}
                                            href={action.href || "/"}
                                            className={cn(
                                                "cursor-pointer px-6 py-3 rounded-lg font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0C]",
                                                action.variant === "primary"
                                                    ? "bg-[#ECEAE4] hover:bg-white text-[#0A0B0C]"
                                                    : "border border-white/[0.12] hover:border-white/[0.24] text-[#ECEAE4]"
                                            )}
                                        >
                                            {action.label}
                                        </Link>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ─── Feature sections: text + diagram, two columns ─────────────────── */}
            {sections.slice(1).map((section, i) => {
                const index = i + 1;
                return (
                    <section
                        key={section.id}
                        ref={(el) => {
                            sectionRefs.current[index] = el;
                        }}
                        className="relative min-h-screen flex items-center z-20 py-28"
                    >
                        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 lg:items-stretch">
                                <div className={cn("h-full flex flex-col justify-center", section.reverse && "lg:order-2")}>
                                    <div
                                        className="inline-flex items-center gap-2 mb-6 text-[11px] uppercase text-[#FF8A3D]"
                                        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.16em" }}
                                    >
                                        <span className="w-1 h-1 rounded-full bg-[#FF8A3D]" />
                                        {section.eyebrow}
                                    </div>
                                    <h2
                                        className="font-semibold mb-6 leading-[1.1] text-3xl sm:text-4xl"
                                        style={{ fontFamily: "var(--font-display)" }}
                                    >
                                        <span>{section.title}</span>
                                        {section.subtitle && (
                                            <>
                                                <br />
                                                <span className="text-[#5F6167]">{section.subtitle}</span>
                                            </>
                                        )}
                                    </h2>
                                    <p className="text-[#8B8D93] leading-relaxed mb-8 text-base sm:text-lg max-w-md">
                                        {section.description}
                                    </p>

                                    {section.readout && (
                                        <div
                                            className="flex flex-wrap gap-x-6 gap-y-3 mb-8 py-4 border-y border-white/[0.08] text-[13px]"
                                            style={{ fontFamily: "var(--font-mono)" }}
                                        >
                                            {section.readout.map((stat) => (
                                                <div key={stat.label} className="flex items-baseline gap-2">
                                                    <span className="text-[#5F6167] uppercase text-[10px] tracking-wider">{stat.label}</span>
                                                    <span className="text-[#ECEAE4] font-medium">{stat.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.features && (
                                        <div className="grid sm:grid-cols-2 gap-px mb-8 bg-white/[0.06] rounded-xl overflow-hidden border border-white/[0.06]">
                                            {section.features.map((feature) => (
                                                <div key={feature.title} className="p-5 bg-[#0A0B0C]">
                                                    <h3 className="font-semibold text-[#ECEAE4] text-[14px] mb-2">{feature.title}</h3>
                                                    <p className="text-[#8B8D93] leading-relaxed text-[13px]">{feature.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.actions && (
                                        <div className="flex flex-wrap gap-3">
                                            {section.actions.map((action) =>
                                                action.actionId === "login" ? (
                                                    <button
                                                        key={action.label}
                                                        onClick={() => setIsLoginOpen(true)}
                                                        className={cn(
                                                            "cursor-pointer px-6 py-3 rounded-lg font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0C]",
                                                            action.variant === "primary"
                                                                ? "bg-[#ECEAE4] hover:bg-white text-[#0A0B0C]"
                                                                : "border border-white/[0.12] hover:border-white/[0.24] text-[#ECEAE4]"
                                                        )}
                                                    >
                                                        {action.label}
                                                    </button>
                                                ) : (
                                                    <Link
                                                        key={action.label}
                                                        href={action.href || "/"}
                                                        className={cn(
                                                            "cursor-pointer px-6 py-3 rounded-lg font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0C]",
                                                            action.variant === "primary"
                                                                ? "bg-[#ECEAE4] hover:bg-white text-[#0A0B0C]"
                                                                : "border border-white/[0.12] hover:border-white/[0.24] text-[#ECEAE4]"
                                                        )}
                                                    >
                                                        {action.label}
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className={cn("h-full flex flex-col justify-center", section.reverse && "lg:order-1")}>
                                    {renderVisual(section.visual, section.distribution)}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* Footer */}
            <footer className="relative z-20 border-t border-white/[0.06] py-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <span className="text-[13px] text-[#5F6167]" style={{ fontFamily: "var(--font-mono)" }}>
                        © 2026 Orqeva™ — agent runtime
                    </span>
                    <div className="flex items-center gap-6 text-[12px] text-[#5F6167]" style={{ fontFamily: "var(--font-mono)" }}>
                        <span>FastAPI</span>
                        <span className="w-0.5 h-0.5 bg-[#3C3E44] rounded-full" />
                        <span>LangGraph</span>
                        <span className="w-0.5 h-0.5 bg-[#3C3E44] rounded-full" />
                        <span>Next.js</span>
                    </div>
                </div>
            </footer>

            {/* Toast */}
            {toast && (
                <div
                    role="status"
                    aria-live="polite"
                    className={cn(
                        "toast-enter fixed bottom-6 right-6 px-5 py-3.5 rounded-xl border flex items-center gap-3 z-[999] bg-[#111317]",
                        toast.type === "success" ? "border-[#3B6D11]/40 text-[#97C459]" : "border-[#791F1F]/40 text-[#F09595]"
                    )}
                >
                    {toast.type === "success" ? (
                        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

// ─── Orqeva™ Landing Page ─────────────────────────────────────────────────────
export default function OrqevaLanding() {
    const aivoraSections: ScrollGlobeSection[] = [
        {
            id: "hero",
            eyebrow: "Orqeva™ — Agent runtime v1.0",
            title: "Build, route, and ship",
            subtitle: "AI agents that hold up in production.",
            description:
                "Orqeva™ is a full-stack platform for document-grounded agents: visual workflows, multi-model routing, and real-time telemetry from a single dashboard.",
            actions: [
                { label: "Launch dashboard", variant: "primary", actionId: "login" },
                { label: "View documentation", variant: "secondary", href: "#" },
            ],
        },
        {
            id: "routing",
            eyebrow: "Multi-model routing",
            title: "One request,",
            subtitle: "the right model.",
            description:
                "Every call is scored against rules, cost, and current load before it's dispatched — so you're never locked into a single provider.",
            visual: "routing",
            distribution: [
                { name: "GPT-4o", pct: 45 },
                { name: "Groq", pct: 35 },
                { name: "OpenRouter", pct: 20 },
            ],
            features: [
                {
                    title: "Contextual memory",
                    description: "Upload PDFs to build an agent's knowledge base with recursive splitting and vector search.",
                },
                {
                    title: "Visual flow builder",
                    description: "Design agent pipelines on a drag-and-drop canvas — no code required to ship a new flow.",
                },
            ],
        },
        {
            id: "observability",
            eyebrow: "Observability",
            title: "Every call,",
            subtitle: "measured.",
            description: "Token usage, latency, and volume are logged and visualized in real time — nothing runs unattended.",
            visual: "observability",
            reverse: true,
            readout: [
                { label: "P50", value: "148ms" },
                { label: "P99", value: "412ms" },
                { label: "Throughput", value: "1.2k req/s" },
                { label: "Uptime", value: "99.98%" },
            ],
            features: [
                {
                    title: "Latency tracking",
                    description: "Every LLM call is instrumented down to token count, response time, and agent attribution.",
                },
                {
                    title: "Live activity feed",
                    description: "Stream events across all agents with filterable, timestamped logs.",
                },
            ],
            actions: [{ label: "Sign in to view", variant: "primary", actionId: "login" }],
        },
        {
            id: "deploy",
            eyebrow: "Go live",
            title: "Embed with",
            subtitle: "one script tag.",
            description: "Drop the widget into any site. It ships fully white-labeled — your colors, your domain, no watermark.",
            visual: "deploy",
            actions: [{ label: "Start free trial", variant: "primary", actionId: "login" }],
        },
    ];

    return <ScrollGlobe sections={aivoraSections} />;
}