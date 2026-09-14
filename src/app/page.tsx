"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Space_Grotesk, IBM_Plex_Mono, Inter } from "next/font/google";
import Globe from "@/components/ui/globe";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";

// ─── Config ──────────────────────────────────────────────────────────────────
import { API_BASE_URL } from "@/services/api";

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
type ActionVariant = "primary" | "secondary";
type ActionId = "login" | undefined;

interface SectionAction {
    label: string;
    variant: ActionVariant;
    href?: string;
    actionId?: ActionId;
}

interface ScrollGlobeSection {
    id: string;
    eyebrow: string;
    title: string;
    subtitle?: string;
    description: string;
    features?: { title: string; description: string }[];
    actions?: SectionAction[];
    readout?: { label: string; value: string }[];
    visual?: "routing" | "observability" | "deploy" | "isolation";
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
        { top: "26%", left: "84%", scale: 1.0 },
        { top: "72%", left: "16%", scale: 1.1 },
        { top: "26%", left: "84%", scale: 1.0 },
        { top: "30%", left: "82%", scale: 1.0 },
    ],
};

const parsePercent = (str: string): number => parseFloat(str.replace("%", ""));

// ─── Shared button styling — one source of truth for every CTA on the page ──
const actionButtonClasses = (variant: ActionVariant) =>
    cn(
        "cursor-pointer px-6 py-3 rounded-lg font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0C]",
        variant === "primary"
            ? "bg-[#ECEAE4] hover:bg-white text-[#0A0B0C]"
            : "border border-white/[0.12] hover:border-white/[0.24] text-[#ECEAE4]"
    );

function ActionGroup({
    actions,
    onLogin,
    align = "start",
}: {
    actions?: SectionAction[];
    onLogin: () => void;
    align?: "start" | "center";
}) {
    if (!actions?.length) return null;
    return (
        <div className={cn("flex flex-wrap gap-3", align === "center" && "justify-center")}>
            {actions.map((action) =>
                action.actionId === "login" ? (
                    <button key={action.label} onClick={onLogin} className={actionButtonClasses(action.variant)}>
                        {action.label}
                    </button>
                ) : (
                    <Link key={action.label} href={action.href || "/"} className={actionButtonClasses(action.variant)}>
                        {action.label}
                    </Link>
                )
            )}
        </div>
    );
}

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
                <p className="text-[11px] text-[#5F6167]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
                    {label}
                </p>
                {corner}
            </div>
            {children}
        </div>
    );
}

// ─── Routing schematic ───────────────────────────────────────────────────────
function RoutingSchematic() {
    const models = ["GPT-4o", "Groq", "OpenRouter"];
    return (
        <DiagramCard label="How a request finds its model">
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
                        Request
                    </text>
                </g>

                <g>
                    <rect x="180" y="71" width="80" height="48" rx="6" fill="#171310" stroke="#FF8A3D" strokeWidth="1.25" />
                    <text x="220" y="92" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="#FF8A3D" fontWeight={500}>
                        Router
                    </text>
                    <text x="220" y="106" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="#B0733F">
                        cost · speed · load
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
                        Reply
                    </text>
                </g>
            </svg>
        </DiagramCard>
    );
}

// ─── Model distribution chart ───────────────────────────────────────────────
function ModelDistributionChart({ data }: { data: { name: string; pct: number }[] }) {
    return (
        <DiagramCard label="Where today's traffic went">
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
            label="Conversations per minute"
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
                aria-label={`Conversations per minute over the last ${samples.length} minutes, currently ${samples[samples.length - 1]} per minute and trending up`}
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
function EmbedFlowDiagram() {
    const steps = ["Your website", "One script tag", "Orqeva™ widget", "Your agent"];
    return (
        <DiagramCard label="What happens after you paste the tag">
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
function AgentOnWebsiteDiagram() {
    return (
        <DiagramCard label="A visitor's message, start to finish">
            <svg
                viewBox="0 0 560 240"
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label="Diagram: a visitor's message to the embedded agent widget on a website is sent to Orqeva™ and logged with response time and status"
            >
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

                <rect x="30" y="60" width="130" height="8" rx="2" fill="#24262B" />
                <rect x="30" y="80" width="220" height="6" rx="2" fill="#1B1D22" />
                <rect x="30" y="94" width="180" height="6" rx="2" fill="#1B1D22" />
                <rect x="30" y="108" width="200" height="6" rx="2" fill="#1B1D22" />

                <rect x="30" y="150" width="160" height="34" rx="9" fill="#1B1D22" stroke="#2A2D33" />
                <text x="44" y="164" fontFamily="var(--font-mono)" fontSize="8" fill="#8B8D93">
                    Visitor
                </text>
                <text x="44" y="176" fontFamily="var(--font-mono)" fontSize="8" fill="#5F6167">
                    Do you ship to Delhi?
                </text>

                <path d="M 190 175 L 300 195" fill="none" stroke="#2A2D33" strokeWidth="1.25" strokeDasharray="3 3" />

                <rect x="290" y="178" width="90" height="42" rx="10" fill="#171310" stroke="#FF8A3D" strokeWidth="1.25" />
                <circle className="schematic-pulse" cx="304" cy="192" r="3" fill="#FF8A3D" />
                <text x="316" y="196" fontFamily="var(--font-mono)" fontSize="9" fill="#FF8A3D" fontWeight={500}>
                    Agent
                </text>
                <text x="304" y="210" fontFamily="var(--font-mono)" fontSize="7.5" fill="#B0733F">
                    on your site
                </text>

                <path d="M 380 199 L 430 199" fill="none" stroke="#2A2D33" strokeWidth="1.5" />

                <rect x="430" y="150" width="120" height="80" rx="8" fill="#15171B" stroke="#33363C" />
                <text x="444" y="172" fontFamily="var(--font-mono)" fontSize="8" fill="#5F6167">
                    Logged
                </text>
                <text x="444" y="192" fontFamily="var(--font-mono)" fontSize="10" fill="#ECEAE4">
                    142ms
                </text>
                <circle className="schematic-pulse" cx="444" cy="208" r="2.5" fill="#639922" />
                <text x="452" y="211" fontFamily="var(--font-mono)" fontSize="7.5" fill="#8B8D93">
                    Answered
                </text>
            </svg>
        </DiagramCard>
    );
}

// ─── Workspace isolation diagram ─────────────────────────────────────────────
function WorkspaceIsolationDiagram() {
    const workspaces = [
        { name: "Acme Support", role: "Admin" },
        { name: "Acme Sales", role: "Member" },
    ];
    return (
        <DiagramCard label="Two teams, one company, no overlap">
            <svg
                viewBox="0 0 560 220"
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label="Diagram: two separate team workspaces, each with its own agents and people, both drawing from one shared library without seeing each other's data"
            >
                <rect x="210" y="12" width="140" height="40" rx="6" fill="#171310" stroke="#FF8A3D" strokeWidth="1.25" />
                <text x="280" y="32" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="#FF8A3D" fontWeight={500}>
                    Shared library
                </text>
                <text x="280" y="45" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="#B0733F">
                    company-wide knowledge
                </text>

                <path d="M 245 52 L 130 92" fill="none" stroke="#2A2D33" strokeWidth="1.25" strokeDasharray="3 3" />
                <path d="M 315 52 L 430 92" fill="none" stroke="#2A2D33" strokeWidth="1.25" strokeDasharray="3 3" />

                {workspaces.map((ws, i) => {
                    const x = i === 0 ? 20 : 340;
                    return (
                        <g key={ws.name}>
                            <rect x={x} y="90" width="200" height="118" rx="10" fill="#0E0F13" stroke="#2A2D33" strokeWidth="1.25" strokeDasharray="4 3" />
                            <text x={x + 14} y="112" fontFamily="var(--font-mono)" fontSize="9.5" fill="#ECEAE4" fontWeight={500}>
                                {ws.name}
                            </text>
                            <rect x={x + 14} y="122" width="64" height="18" rx="9" fill="#15171B" stroke="#33363C" />
                            <text x={x + 46} y="134" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="#8B8D93">
                                {ws.role}
                            </text>

                            <rect x={x + 14} y="152" width="80" height="34" rx="6" fill="#15171B" stroke="#33363C" />
                            <circle className="schematic-pulse" cx={x + 26} cy="169" r="2.5" fill="#639922" />
                            <text x={x + 36} y="172" fontFamily="var(--font-mono)" fontSize="8" fill="#ECEAE4">
                                Agent A
                            </text>

                            <rect x={x + 106} y="152" width="80" height="34" rx="6" fill="#15171B" stroke="#33363C" />
                            <circle className="schematic-pulse" cx={x + 118} cy="169" r="2.5" fill="#639922" style={{ animationDelay: "0.6s" }} />
                            <text x={x + 128} y="172" fontFamily="var(--font-mono)" fontSize="8" fill="#ECEAE4">
                                Agent B
                            </text>
                        </g>
                    );
                })}

                <line x1="280" y1="100" x2="280" y2="198" stroke="#33363C" strokeWidth="1" strokeDasharray="2 4" />
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
    const [authMode, setAuthMode] = useState<"login" | "request">("login");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [requestName, setRequestName] = useState("");
    const [requestEmail, setRequestEmail] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [isRequesting, setIsRequesting] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 3000);
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);
    const animationFrameId = useRef<number | undefined>(undefined);
    const firstFieldRef = useRef<HTMLInputElement>(null);

    const calculatedPositions = useMemo(
        () =>
            globeConfig.positions.map((pos) => ({
                top: parsePercent(pos.top),
                left: parsePercent(pos.left),
                scale: pos.scale,
            })),
        [globeConfig.positions]
    );

    const scrollToSection = useCallback((index: number) => {
        sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, []);

    const openAuth = useCallback((mode: "login" | "request" = "login") => {
        setAuthMode(mode);
        setIsLoginOpen(true);
    }, []);

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

        const pos = calculatedPositions[newActiveSection] || calculatedPositions[calculatedPositions.length - 1];
        if (pos) {
            setGlobeTransform(
                `translate3d(${pos.left}vw, ${pos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${pos.scale}, ${pos.scale}, 1)`
            );
        }
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
        const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 50);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.clearTimeout(focusTimer);
        };
    }, [isLoginOpen, authMode]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok && data.status === "success") {
                localStorage.setItem("token", data.token);
                showToast("Signed in. Taking you to your dashboard.", "success");
                window.setTimeout(() => router.push("/dashboard"), 1200);
            } else {
                showToast(data.message || "That email or password didn't match.", "error");
                setIsLoggingIn(false);
            }
        } catch {
            showToast("Couldn't reach the server. Check your connection.", "error");
            setIsLoggingIn(false);
        }
    };

    const handleRequestAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRequesting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/request-access`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: requestName, email: requestEmail, message: requestMessage }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Request sent. We'll be in touch shortly.", "success");
                setIsLoginOpen(false);
                setRequestName("");
                setRequestEmail("");
                setRequestMessage("");
            } else {
                showToast(data.detail || "Couldn't send your request.", "error");
            }
        } catch (error) {
            console.error("Request failed", error);
            showToast("Couldn't reach the server. Check your connection.", "error");
        } finally {
            setIsRequesting(false);
        }
    };

    const navItems = [
        { label: "Routing", index: 1 },
        { label: "Visibility", index: 2 },
        { label: "Teams", index: 3 },
        { label: "Go live", index: 4 },
    ];

    const renderVisual = (visual: ScrollGlobeSection["visual"], distribution?: { name: string; pct: number }[]) => {
        switch (visual) {
            case "routing":
                return (
                    <div className="flex flex-col gap-6">
                        <RoutingSchematic />
                        {distribution && <ModelDistributionChart data={distribution} />}
                    </div>
                );
            case "observability":
                return (
                    <div className="flex flex-col gap-6">
                        <AgentOnWebsiteDiagram />
                        <RequestVolumeChart />
                    </div>
                );
            case "isolation":
                return (
                    <div className="flex flex-col gap-6">
                        <WorkspaceIsolationDiagram />
                    </div>
                );
            case "deploy":
                return (
                    <div className="flex flex-col gap-6">
                        <EmbedFlowDiagram />
                        <DiagramCard label="What you paste into your site">
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
            default:
                return null;
        }
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
                        }
                        @media (prefers-reduced-motion: reduce) {
                            .toast-enter, .modal-enter { animation: none; }
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
                        <Bot className="w-5 h-5 text-[#FF8A3D]" aria-hidden="true" />
                        <span className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
                            Orqeva™
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => scrollToSection(item.index)}
                                className="cursor-pointer text-[13px] font-medium text-[#8B8D93] hover:text-[#ECEAE4] transition-colors focus-visible:outline-none focus-visible:text-[#ECEAE4]"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => openAuth("login")}
                        className="cursor-pointer px-4 py-2 bg-[#ECEAE4] hover:bg-white text-[#0A0B0C] rounded-md text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0C]"
                    >
                        Open dashboard
                    </button>
                </div>
            </nav>

            {/* Progress bar */}
            <div className="fixed top-16 left-0 w-full h-px bg-white/[0.06] z-40" aria-hidden="true">
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
                        onClick={() => scrollToSection(index)}
                        aria-label={`Go to ${section.eyebrow} section`}
                        className="group relative flex items-center justify-end cursor-pointer"
                    >
                        <span
                            className={cn(
                                "mr-3 px-2.5 py-1 rounded text-[11px] whitespace-nowrap bg-[#111317] border border-white/[0.08]",
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

            {/* Background orbit — a single connecting thread the globe rides through the page,
                unique to the "runtime" idea rather than a generic decorative gradient. */}
            <svg
                className="hidden lg:block fixed inset-0 w-full h-full z-[5] pointer-events-none"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
                aria-hidden="true"
            >
                <path
                    d="M 50 48 C 70 40, 85 32, 82 26 C 78 18, 40 55, 16 70 C 8 75, 8 78, 15 74"
                    fill="none"
                    stroke="#FF8A3D"
                    strokeOpacity="0.12"
                    strokeWidth="0.15"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {/* Globe */}
            <div
                className="fixed z-10 pointer-events-none will-change-transform transition-transform duration-[1100ms] ease-[cubic-bezier(0.25,1,0.35,1)]"
                style={{
                    transform: globeTransform,
                    opacity: activeSection === 0 ? 0.55 : 0.16,
                    filter: "saturate(0.7) sepia(0.15) hue-rotate(-10deg)",
                }}
                aria-hidden="true"
            >
                <div className="scale-[0.8] sm:scale-100 lg:scale-[1.1]">
                    <Globe />
                </div>
            </div>

            {/* Login / request-access modal */}
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
                            <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="mb-8">
                            <p className="text-[11px] text-[#FF8A3D] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                                {authMode === "login" ? "Sign in" : "Get access"}
                            </p>
                            <h2 id="login-heading" className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                                {authMode === "login" ? "Welcome back" : "Tell us about your team"}
                            </h2>
                        </div>

                        {authMode === "login" ? (
                            <>
                                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                                    <div>
                                        <label htmlFor="email" className="block text-[11px] font-medium text-[#8B8D93] mb-1.5">
                                            Email
                                        </label>
                                        <input
                                            ref={firstFieldRef}
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
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
                                            <Link href="/forgot-password" className="text-[11px] text-[#FF8A3D] hover:text-[#FFA867]">
                                                Forgot it?
                                            </Link>
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
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
                                        {isLoggingIn ? "Signing in…" : "Sign in"}
                                    </button>
                                </form>
                                <div className="mt-6 text-center text-xs text-[#8B8D93]">
                                    New here?{" "}
                                    <button onClick={() => setAuthMode("request")} className="text-[#ECEAE4] font-medium hover:text-[#FF8A3D] transition-colors underline underline-offset-2">
                                        Request access
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <form onSubmit={handleRequestAccess} className="space-y-4" noValidate>
                                    <div>
                                        <label htmlFor="req_name" className="block text-[11px] font-medium text-[#8B8D93] mb-1.5">
                                            Full name
                                        </label>
                                        <input
                                            ref={firstFieldRef}
                                            id="req_name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            required
                                            value={requestName}
                                            onChange={(e) => setRequestName(e.target.value)}
                                            className="w-full bg-[#0A0B0C] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-[#ECEAE4] placeholder-[#4A4C52] focus:outline-none focus:border-[#FF8A3D]/60 transition-colors"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="req_email" className="block text-[11px] font-medium text-[#8B8D93] mb-1.5">
                                            Work email
                                        </label>
                                        <input
                                            id="req_email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={requestEmail}
                                            onChange={(e) => setRequestEmail(e.target.value)}
                                            className="w-full bg-[#0A0B0C] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-[#ECEAE4] placeholder-[#4A4C52] focus:outline-none focus:border-[#FF8A3D]/60 transition-colors"
                                            placeholder="jane@company.com"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="req_message" className="block text-[11px] font-medium text-[#8B8D93] mb-1.5">
                                            What will you use it for?
                                        </label>
                                        <textarea
                                            id="req_message"
                                            name="message"
                                            required
                                            value={requestMessage}
                                            onChange={(e) => setRequestMessage(e.target.value)}
                                            className="w-full bg-[#0A0B0C] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-[#ECEAE4] placeholder-[#4A4C52] focus:outline-none focus:border-[#FF8A3D]/60 transition-colors h-20 resize-none"
                                            placeholder="A couple of sentences is plenty"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isRequesting}
                                        className={cn(
                                            "w-full mt-2 rounded-lg bg-[#ECEAE4] hover:bg-white disabled:opacity-60 text-[#0A0B0C] font-semibold text-sm py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111317]",
                                            isRequesting ? "cursor-not-allowed" : "cursor-pointer"
                                        )}
                                    >
                                        {isRequesting ? "Sending…" : "Send request"}
                                    </button>
                                </form>
                                <div className="mt-6 text-center text-xs text-[#8B8D93]">
                                    Already have an account?{" "}
                                    <button onClick={() => setAuthMode("login")} className="text-[#ECEAE4] font-medium hover:text-[#FF8A3D] transition-colors underline underline-offset-2">
                                        Sign in
                                    </button>
                                </div>
                            </>
                        )}
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
                        <div className="inline-flex items-center gap-2 mb-6 text-[12px] text-[#FF8A3D]" style={{ fontFamily: "var(--font-mono)" }}>
                            <span className="w-1 h-1 rounded-full bg-[#FF8A3D]" />
                            {sections[0].eyebrow}
                        </div>
                        <h1 className="font-semibold mb-6 leading-[1.08] text-4xl sm:text-5xl md:text-6xl lg:text-7xl" style={{ fontFamily: "var(--font-display)" }}>
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
                        <ActionGroup actions={sections[0].actions} onLogin={() => openAuth("login")} align="center" />
                    </div>
                </div>
            </section>

            {/* ─── Feature sections: text + diagram, aligned as a matched pair ───── */}
            {sections.slice(1).map((section, i) => {
                const index = i + 1;
                return (
                    <section
                        key={section.id}
                        ref={(el) => {
                            sectionRefs.current[index] = el;
                        }}
                        className="relative flex items-center z-20 py-24 lg:py-28 lg:min-h-screen"
                    >
                        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12 lg:gap-x-20 items-center">
                                <div className={cn("flex flex-col", section.reverse && "lg:order-2")}>
                                    <div className="inline-flex items-center gap-2 mb-5 text-[12px] text-[#FF8A3D]" style={{ fontFamily: "var(--font-mono)" }}>
                                        <span className="w-1 h-1 rounded-full bg-[#FF8A3D]" />
                                        {section.eyebrow}
                                    </div>
                                    <h2 className="font-semibold mb-5 leading-[1.1] text-3xl sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                                        <span>{section.title}</span>
                                        {section.subtitle && (
                                            <>
                                                <br />
                                                <span className="text-[#5F6167]">{section.subtitle}</span>
                                            </>
                                        )}
                                    </h2>
                                    <p className="text-[#8B8D93] leading-relaxed mb-8 text-base sm:text-lg max-w-md">{section.description}</p>

                                    {section.readout && (
                                        <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 py-4 border-y border-white/[0.08] text-[13px]" style={{ fontFamily: "var(--font-mono)" }}>
                                            {section.readout.map((stat) => (
                                                <div key={stat.label} className="flex items-baseline gap-2">
                                                    <span className="text-[#5F6167] text-[11px]">{stat.label}</span>
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

                                    <ActionGroup actions={section.actions} onLogin={() => openAuth("login")} />
                                </div>

                                <div className={cn("w-full", section.reverse && "lg:order-1")}>{renderVisual(section.visual, section.distribution)}</div>
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* Footer */}
            <footer className="relative z-20 border-t border-white/[0.06] py-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <span className="text-[13px] text-[#5F6167]" style={{ fontFamily: "var(--font-mono)" }}>
                        © {new Date().getFullYear()} Orqeva™
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
                        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
    const orqevaSections: ScrollGlobeSection[] = [
        {
            id: "hero",
            eyebrow: "Orqeva™ agent runtime",
            title: "Build, launch, and run",
            subtitle: "AI agents your whole company can trust.",
            description:
                "Orqeva™ gives you a visual builder for agents, separate spaces for every team, and a live view of everything happening across them, all in one dashboard.",
            actions: [
                { label: "Open dashboard", variant: "primary", actionId: "login" },
                { label: "Read the docs", variant: "secondary", href: "/docs" },
            ],
        },
        {
            id: "routing",
            eyebrow: "Smart routing",
            title: "One question,",
            subtitle: "always the right model.",
            description:
                "Each request is checked against your budget, speed needs, and which providers are healthy right now, then sent to the best fit automatically. If one provider slows down or goes offline, your agents keep answering.",
            visual: "routing",
            distribution: [
                { name: "GPT-4o", pct: 45 },
                { name: "Groq", pct: 35 },
                { name: "OpenRouter", pct: 20 },
            ],
            features: [
                {
                    title: "Give agents a memory",
                    description: "Upload PDFs and other documents, and your agent can search and reference them while it answers.",
                },
                {
                    title: "Design without code",
                    description: "Lay out how an agent should behave on a visual canvas, then publish it in a click.",
                },
            ],
        },
        {
            id: "observability",
            eyebrow: "Full visibility",
            title: "See what your",
            subtitle: "agents are doing.",
            description:
                "Every conversation, its cost, and how long it took is recorded as it happens. A slow week or a busy morning shows up on your dashboard, not in a customer complaint.",
            visual: "observability",
            reverse: true,
            readout: [
                { label: "Typical reply", value: "148ms" },
                { label: "Slowest 1%", value: "412ms" },
                { label: "Handled today", value: "1.2k / sec" },
                { label: "Uptime", value: "99.98%" },
            ],
            features: [
                {
                    title: "Track every reply",
                    description: "See exactly how long each answer took and which agent it came from.",
                },
                {
                    title: "Watch it happen live",
                    description: "Follow activity across every agent in one feed, filterable by team or time.",
                },
            ],
            actions: [{ label: "Sign in to view", variant: "primary", actionId: "login" }],
        },
        {
            id: "enterprise",
            eyebrow: "Built for teams",
            title: "Separate spaces,",
            subtitle: "shared knowledge.",
            description:
                "Every team gets its own space for agents, documents, and history, kept apart from every other team's. Meanwhile, company-wide information can still be published once and made available everywhere.",
            visual: "isolation",
            features: [
                {
                    title: "Set who can do what",
                    description: "Give people owner, admin, or member access, and decide who can see documents, history, or branding.",
                },
                {
                    title: "One source of truth",
                    description: "Publish core company knowledge once. Every team can use it without ever seeing another team's data.",
                },
            ],
            actions: [{ label: "See how spaces work", variant: "secondary", href: "/docs/workspaces" }],
        },
        {
            id: "deploy",
            eyebrow: "Go live",
            title: "Add one line",
            subtitle: "and you're live.",
            description:
                "Paste a single script tag into your site and your agent appears, styled to match your brand, with nothing pointing back to us.",
            visual: "deploy",
            actions: [{ label: "Start free trial", variant: "primary", actionId: "login" }],
        },
    ];

    return <ScrollGlobe sections={orqevaSections} />;
}