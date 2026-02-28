"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { Plus, QrCode, Users, Calendar, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { TOKEN_EXPIRY_MINUTES } from "../config";
import { STUDENTS } from "../data/students";

interface Session {
    session_id: string;
    session_name: string;
    course_id: string;
    created_at: string;
}

/* ─── Animated Background Component ─── */
function AnimatedBackground() {
    return (
        <>
            {/* Grid pattern overlay */}
            <div style={{
                position: "absolute", inset: 0, opacity: 0.03,
                backgroundImage: `linear-gradient(rgba(129,140,248,0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(129,140,248,0.5) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
                animation: "gridPulse 4s ease-in-out infinite",
            }} />

            {/* Aurora blobs */}
            <div className="aurora-blob aurora-1" />
            <div className="aurora-blob aurora-2" />
            <div className="aurora-blob aurora-3" />

            {/* Floating sparkles */}
            {[...Array(12)].map((_, i) => (
                <div key={i} className="sparkle" style={{
                    left: `${8 + (i * 7.5) % 85}%`,
                    top: `${10 + (i * 13) % 80}%`,
                    animationDelay: `${i * 0.7}s`,
                    animationDuration: `${3 + (i % 3)}s`,
                }} />
            ))}

            {/* Scan line */}
            <div className="scan-line" />
        </>
    );
}

/* ─── Animated Number Counter ─── */
function CounterBadge({ count, label }: { count: number; label: string }) {
    return (
        <span className="counter-badge">
            <span className="counter-badge-num">{count}</span> {label}
        </span>
    );
}

export default function AdminPage() {
    const [courseId, setCourseId] = useState("cloud-101");
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);

    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [qrToken, setQrToken] = useState("");
    const [qrExpiry, setQrExpiry] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [generating, setGenerating] = useState(false);
    const [attendees, setAttendees] = useState<{ user_id: string; ts: string }[]>([]);

    const fetchSessions = useCallback(async () => {
        try {
            const params = new URLSearchParams({ path: "presence/sessions", course_id: courseId });
            const res = await fetch(`/api/proxy?${params}`);
            const json = await res.json();
            if (json.ok) setSessions(json.data.sessions || []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [courseId]);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        setError("");
        const sessionId = "sesi-" + String(sessions.length + 1).padStart(2, "0");
        try {
            const res = await fetch("/api/proxy?path=presence/sessions/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId, session_name: newName.trim(), course_id: courseId }),
            });
            const json = await res.json();
            if (json.ok) { setNewName(""); setShowNewForm(false); fetchSessions(); }
            else setError(json.error || "Gagal membuat sesi");
        } catch (err) { setError("Network error: " + (err as Error).message); }
        finally { setCreating(false); }
    };

    const generateQR = async (session: Session) => {
        setGenerating(true);
        setQrToken("");
        try {
            const res = await fetch("/api/proxy?path=presence/qr/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ course_id: session.course_id, session_id: session.session_id }),
            });
            const json = await res.json();
            if (json.ok) { setQrToken(json.data.qr_token); setQrExpiry(json.data.expires_at); }
        } catch { /* ignore */ }
        finally { setGenerating(false); }
    };

    useEffect(() => {
        if (!qrExpiry) return;
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((new Date(qrExpiry).getTime() - Date.now()) / 1000));
            setCountdown(remaining);
            if (remaining <= 0) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [qrExpiry]);

    useEffect(() => {
        if (!activeSession) return;
        const fetchAttendance = async () => {
            try {
                const params = new URLSearchParams({
                    path: "presence/session-attendance",
                    session_id: activeSession.session_id,
                    course_id: activeSession.course_id,
                });
                const res = await fetch(`/api/proxy?${params}`);
                const json = await res.json();
                if (json.ok) setAttendees(json.data.attendees || []);
            } catch { /* ignore */ }
        };
        fetchAttendance();
        const interval = setInterval(fetchAttendance, 3000);
        return () => clearInterval(interval);
    }, [activeSession]);

    const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

    // Shared styles
    const s = {
        page: { position: "relative" as const, minHeight: "100vh", background: "#06060f", overflow: "hidden" as const },
        mesh: {
            position: "absolute" as const, inset: 0,
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%),
                radial-gradient(ellipse 60% 50% at 80% 100%, rgba(139,92,246,0.08) 0%, transparent 60%)`,
        },
        main: { position: "relative" as const, zIndex: 10, padding: "0 1.5rem" },
        card: {
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "1rem",
            backdropFilter: "blur(20px)",
        },
        heading: { color: "#eef0f6", fontWeight: 700 as const },
        accent: { color: "#818cf8" },
        btnPrimary: {
            display: "inline-flex" as const, alignItems: "center" as const, justifyContent: "center" as const,
            gap: "0.5rem", padding: "0.6rem 1.25rem",
            background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff",
            fontWeight: 600 as const, fontSize: "0.85rem", border: "none", borderRadius: "0.75rem",
            cursor: "pointer" as const, transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(99,102,241,0.25)",
        },
        btnSecondary: {
            display: "inline-flex" as const, alignItems: "center" as const, gap: "0.5rem",
            padding: "0.5rem 1rem", background: "rgba(255,255,255,0.05)",
            color: "#eef0f6", fontWeight: 600 as const, fontSize: "0.85rem",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem",
            cursor: "pointer" as const, transition: "all 0.3s ease", textDecoration: "none" as const,
        },
        btnSuccess: {
            display: "inline-flex" as const, alignItems: "center" as const, justifyContent: "center" as const,
            gap: "0.5rem", padding: "0.6rem 1.25rem",
            background: "linear-gradient(135deg, #16a34a, #22c55e)", color: "#fff",
            fontWeight: 600 as const, fontSize: "0.85rem", border: "none", borderRadius: "0.75rem",
            cursor: "pointer" as const, transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(34,197,94,0.25)",
        },
        input: {
            width: "100%", padding: "0.75rem 1rem",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.75rem", color: "#eef0f6", fontSize: "0.95rem",
            outline: "none", transition: "all 0.3s ease",
        },
        label: {
            display: "block" as const, marginBottom: "0.4rem",
            fontSize: "0.8rem", fontWeight: 600 as const, color: "#64748b",
            letterSpacing: "0.08em", textTransform: "uppercase" as const,
        },
        badge: (bg: string, color: string, border: string) => ({
            display: "inline-flex" as const, alignItems: "center" as const, gap: "0.35rem",
            padding: "0.3rem 0.75rem", borderRadius: 9999, fontSize: "0.75rem",
            fontWeight: 600 as const, background: bg, color, border: `1px solid ${border}`,
        }),
    };

    // ── ACTIVE SESSION VIEW ──
    if (activeSession) {
        const qrUrl = qrToken
            ? `${typeof window !== "undefined" ? window.location.origin : ""}/student?token=${qrToken}`
            : "";

        return (
            <div style={s.page}>
                <div style={s.mesh} />
                <AnimatedBackground />

                <main style={{ ...s.main, maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
                    {/* Header */}
                    <div className="slide-down" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <button className="btn-hover-glow" style={s.btnSecondary} onClick={() => { setActiveSession(null); setQrToken(""); setAttendees([]); }}>
                            <ArrowLeft size={16} /> Kembali
                        </button>
                        <div style={{ textAlign: "right" }}>
                            <p className="text-glow" style={{ fontSize: "0.95rem", fontWeight: 600, color: "#eef0f6" }}>{activeSession.session_name}</p>
                            <p style={{ fontSize: "0.8rem", color: "#64748b" }}>{activeSession.course_id}</p>
                        </div>
                    </div>

                    {/* Split Layout */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        {/* LEFT: QR Code */}
                        <div className="card-reveal" style={{ ...s.card, padding: "2.5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animationDelay: "0.1s" }}>
                            {qrToken ? (
                                <>
                                    <div className="qr-glow-ring" style={{
                                        padding: "1.5rem", borderRadius: "1.25rem", background: "#fff",
                                        marginBottom: "1.5rem",
                                    }}>
                                        <QRCodeSVG value={qrUrl} size={260} level="H" bgColor="#ffffff" fgColor="#0a0a12" />
                                    </div>
                                    <p className="token-text" style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: "#818cf8", marginBottom: "0.5rem" }}>
                                        {qrToken}
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                                        {countdown > 0 ? (
                                            <span className={countdown <= 30 ? "pulse" : "badge-breathe"} style={
                                                countdown <= 30
                                                    ? s.badge("rgba(245,158,11,0.15)", "#f59e0b", "rgba(245,158,11,0.3)")
                                                    : s.badge("rgba(34,197,94,0.15)", "#22c55e", "rgba(34,197,94,0.3)")
                                            }>
                                                ⏱ {formatCountdown(countdown)} tersisa
                                            </span>
                                        ) : (
                                            <span className="badge-shake" style={s.badge("rgba(239,68,68,0.15)", "#ef4444", "rgba(239,68,68,0.3)")}>Expired</span>
                                        )}
                                    </div>
                                    <button className="btn-hover-glow" style={s.btnSecondary} onClick={() => generateQR(activeSession)} disabled={generating}>
                                        <QrCode size={16} /> Generate Baru
                                    </button>
                                </>
                            ) : (
                                <div style={{ textAlign: "center" }}>
                                    <div className="icon-float" style={{
                                        width: 80, height: 80, borderRadius: 20, margin: "0 auto 1.5rem",
                                        background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <QrCode size={36} style={{ color: "#818cf8" }} />
                                    </div>
                                    <p style={{ marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 600, color: "#eef0f6" }}>Generate QR Code</p>
                                    <p style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "#64748b" }}>
                                        Buat QR Token untuk sesi ini. Berlaku {TOKEN_EXPIRY_MINUTES} menit.
                                    </p>
                                    <button className="btn-ripple" style={s.btnPrimary} onClick={() => generateQR(activeSession)} disabled={generating}>
                                        {generating ? <Loader2 size={18} className="animate-spin" /> : <QrCode size={18} />}
                                        Generate QR
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Real-time Attendance */}
                        <div className="card-reveal" style={{ ...s.card, padding: "1.5rem", animationDelay: "0.2s", display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <Users size={20} style={{ color: "#818cf8" }} />
                                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#eef0f6" }}>Kehadiran</h2>
                                </div>
                                <CounterBadge count={attendees.length} label="hadir" />
                            </div>

                            {attendees.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "3rem 1rem", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                    <div className="icon-float" style={{
                                        width: 64, height: 64, borderRadius: 16, margin: "0 auto 1rem",
                                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Users size={28} style={{ color: "#475569" }} />
                                    </div>
                                    <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "0.25rem" }}>Belum ada yang check-in</p>
                                    <p style={{ fontSize: "0.75rem", color: "#475569" }}>
                                        <span className="live-dot" /> Auto-update setiap 3 detik
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 480, overflowY: "auto", paddingRight: 4 }}>
                                    {attendees.map((a, i) => (
                                        <div
                                            key={a.user_id}
                                            className="attendee-row slide-in-right"
                                            style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                borderRadius: "0.75rem", padding: "0.75rem 1rem",
                                                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                                                transition: "all 0.2s ease", animationDelay: `${i * 0.06}s`,
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <div className="num-pop" style={{
                                                    width: 32, height: 32, borderRadius: 8,
                                                    background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: "0.75rem", fontWeight: 700, color: "#4ade80",
                                                    animationDelay: `${i * 0.06 + 0.3}s`,
                                                }}>
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#eef0f6" }}>
                                                        {STUDENTS.find(st => st.nim === a.user_id)?.nama || a.user_id}
                                                    </p>
                                                    <p style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                                        {a.user_id} &middot; {new Date(a.ts).toLocaleTimeString("id-ID")}
                                                    </p>
                                                </div>
                                            </div>
                                            <span style={{
                                                ...s.badge("rgba(34,197,94,0.12)", "#4ade80", "rgba(34,197,94,0.2)"),
                                                fontSize: "0.65rem",
                                            }}>
                                                ✓ Hadir
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <style>{adminAnimationCSS}</style>
            </div>
        );
    }

    // ── SESSION DASHBOARD ──
    return (
        <div style={s.page}>
            <div style={s.mesh} />
            <AnimatedBackground />

            <main style={{ ...s.main, maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
                {/* Header */}
                <div className="slide-down" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <Link href="/" className="btn-hover-glow" style={s.btnSecondary}>
                        <ArrowLeft size={16} /> Kembali
                    </Link>
                    <span className="badge-breathe" style={s.badge("rgba(99,102,241,0.12)", "#818cf8", "rgba(99,102,241,0.2)")}>
                        🎓 Admin / Dosen
                    </span>
                </div>

                {/* Title */}
                <h1 className="title-reveal" style={{ fontSize: "2rem", fontWeight: 800, color: "#eef0f6", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                    Manajemen Sesi
                </h1>
                <p className="slide-up" style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "1.5rem", animationDelay: "0.15s" }}>
                    Kelola pertemuan kuliah dan generate QR presensi.
                </p>

                {/* Course ID */}
                <div className="slide-up" style={{ marginBottom: "1.5rem", animationDelay: "0.2s" }}>
                    <label style={s.label}>Course ID</label>
                    <input
                        type="text"
                        className="input-focus-glow"
                        style={s.input}
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        placeholder="cloud-101"
                    />
                </div>

                {error && (
                    <div className="shake-in" style={{
                        padding: "0.75rem 1rem", borderRadius: "0.75rem", marginBottom: "1rem",
                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444",
                        fontSize: "0.85rem", fontWeight: 500,
                    }}>
                        {error}
                    </div>
                )}

                {/* Session List */}
                <div className="slide-up" style={{ animationDelay: "0.25s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: 700, color: "#eef0f6" }}>
                            <Calendar size={20} style={{ color: "#818cf8" }} /> Pertemuan
                        </h2>
                        <button className="btn-ripple" style={s.btnPrimary} onClick={() => setShowNewForm(!showNewForm)}>
                            <Plus size={16} /> Tambah Sesi
                        </button>
                    </div>

                    {/* New session form */}
                    {showNewForm && (
                        <div className="card-reveal" style={{ ...s.card, padding: "1.25rem", marginBottom: "1rem" }}>
                            <label style={s.label}>Nama Pertemuan</label>
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <input
                                    type="text"
                                    className="input-focus-glow"
                                    style={{ ...s.input, flex: 1 }}
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Minggu 1 — Pengenalan Cloud Computing"
                                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                    autoFocus
                                />
                                <button
                                    className="btn-ripple"
                                    style={{ ...s.btnSuccess, whiteSpace: "nowrap" }}
                                    onClick={handleCreate}
                                    disabled={creating || !newName.trim()}
                                >
                                    {creating ? <Loader2 size={16} className="animate-spin" /> : "Simpan"}
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "3rem 0" }}>
                            <Loader2 size={32} className="animate-spin" style={{ color: "#818cf8", margin: "0 auto 0.75rem", display: "block" }} />
                            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Memuat...</p>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="card-reveal" style={{ ...s.card, padding: "2.5rem", textAlign: "center" }}>
                            <div className="icon-float" style={{
                                width: 64, height: 64, borderRadius: 16, margin: "0 auto 1rem",
                                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Calendar size={28} style={{ color: "#475569" }} />
                            </div>
                            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                                Belum ada sesi. Klik &quot;Tambah Sesi&quot; untuk membuat pertemuan baru.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                            {sessions.map((ses, i) => (
                                <div
                                    key={ses.session_id}
                                    className="session-card slide-in-right"
                                    style={{
                                        ...s.card, padding: "1rem 1.25rem", cursor: "pointer",
                                        transition: "all 0.3s ease", animationDelay: `${i * 0.08}s`,
                                    }}
                                    onClick={() => { setActiveSession(ses); setQrToken(""); setAttendees([]); }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div className="icon-pulse-ring" style={{
                                                width: 42, height: 42, borderRadius: 12,
                                                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <QrCode size={20} style={{ color: "#818cf8" }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#eef0f6" }}>{ses.session_name}</p>
                                                <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{ses.session_id}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="chevron-anim" style={{ color: "#475569", transition: "all 0.3s" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <style>{adminAnimationCSS}</style>
        </div>
    );
}

/* ═════════ All animation CSS ═════════ */
const adminAnimationCSS = `
/* ── Aurora blobs ── */
.aurora-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.35;
    pointer-events: none;
    mix-blend-mode: screen;
}
.aurora-1 {
    width: 500px; height: 500px;
    top: -15%; left: -10%;
    background: radial-gradient(circle, rgba(99,102,241,0.4), rgba(139,92,246,0.1), transparent 70%);
    animation: auroraMove1 12s ease-in-out infinite;
}
.aurora-2 {
    width: 400px; height: 400px;
    bottom: -10%; right: -5%;
    background: radial-gradient(circle, rgba(139,92,246,0.35), rgba(99,102,241,0.1), transparent 70%);
    animation: auroraMove2 15s ease-in-out infinite;
}
.aurora-3 {
    width: 300px; height: 300px;
    top: 40%; right: 20%;
    background: radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%);
    animation: auroraMove3 10s ease-in-out infinite;
}

@keyframes auroraMove1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -40px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
}
@keyframes auroraMove2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, 30px) scale(1.05); }
    66% { transform: translate(20px, -30px) scale(1.1); }
}
@keyframes auroraMove3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -20px) scale(1.15); }
}

/* ── Grid pulse ── */
@keyframes gridPulse {
    0%, 100% { opacity: 0.03; }
    50% { opacity: 0.06; }
}

/* ── Sparkles ── */
.sparkle {
    position: absolute;
    width: 3px; height: 3px;
    border-radius: 50%;
    background: #818cf8;
    box-shadow: 0 0 6px 2px rgba(129,140,248,0.4);
    pointer-events: none;
    animation: sparkleAnim 3s ease-in-out infinite;
}
@keyframes sparkleAnim {
    0%, 100% { opacity: 0; transform: scale(0.5); }
    50% { opacity: 0.8; transform: scale(1.2); }
}

/* ── Scan line ── */
.scan-line {
    position: absolute;
    left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(129,140,248,0.15), transparent);
    pointer-events: none;
    animation: scanLineMove 6s linear infinite;
}
@keyframes scanLineMove {
    0% { top: -2%; }
    100% { top: 102%; }
}

/* ── Slide / Reveal animations ── */
.slide-down {
    animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

.slide-up {
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
}

.slide-in-right {
    animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes slideInRight {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
}

.title-reveal {
    animation: titleReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes titleReveal {
    from { opacity: 0; transform: translateY(30px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

.card-reveal {
    animation: cardReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes cardReveal {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Shake in (error) ── */
.shake-in {
    animation: shakeIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
@keyframes shakeIn {
    0% { transform: translateX(-10px); opacity: 0; }
    20% { transform: translateX(8px); }
    40% { transform: translateX(-6px); }
    60% { transform: translateX(4px); }
    80% { transform: translateX(-2px); }
    100% { transform: translateX(0); opacity: 1; }
}

/* ── Floating icon ── */
.icon-float {
    animation: iconFloat 3s ease-in-out infinite;
}
@keyframes iconFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}

/* ── Icon pulse ring ── */
.icon-pulse-ring {
    position: relative;
}
.icon-pulse-ring::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 14px;
    border: 1px solid rgba(99,102,241,0.15);
    animation: pulseRing 2.5s ease-out infinite;
    pointer-events: none;
}
@keyframes pulseRing {
    0% { transform: scale(1); opacity: 0.5; }
    100% { transform: scale(1.3); opacity: 0; }
}

/* ── Number pop ── */
.num-pop {
    animation: numPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes numPop {
    from { transform: scale(0); }
    to { transform: scale(1); }
}

/* ── Session card hover ── */
.session-card {
    position: relative;
    overflow: hidden;
}
.session-card::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(129,140,248,0.04), transparent);
    transition: left 0.5s ease;
}
.session-card:hover::before {
    left: 100%;
}
.session-card:hover {
    border-color: rgba(99,102,241,0.3) !important;
    background: rgba(255,255,255,0.05) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 20px rgba(99,102,241,0.08) !important;
}
.session-card:hover .chevron-anim {
    transform: translateX(4px);
    color: #818cf8 !important;
}

/* ── Button hover glow ── */
.btn-hover-glow {
    position: relative;
    overflow: hidden;
}
.btn-hover-glow::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s;
    box-shadow: inset 0 0 20px rgba(129,140,248,0.15);
}
.btn-hover-glow:hover::after {
    opacity: 1;
}
.btn-hover-glow:hover {
    border-color: rgba(129,140,248,0.3) !important;
    transform: translateY(-1px);
}

/* ── Button ripple effect ── */
.btn-ripple {
    position: relative;
    overflow: hidden;
}
.btn-ripple::after {
    content: '';
    position: absolute;
    width: 100%; height: 100%;
    top: 0; left: 0;
    background: radial-gradient(circle, rgba(255,255,255,0.25) 10%, transparent 10.01%);
    transform: scale(10);
    opacity: 0;
    transition: transform 0.5s, opacity 0.5s;
}
.btn-ripple:active::after {
    transform: scale(0);
    opacity: 0.3;
    transition: 0s;
}
.btn-ripple:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(99,102,241,0.35) !important;
}

/* ── Input focus glow ── */
.input-focus-glow:focus {
    border-color: rgba(129,140,248,0.5) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1), 0 0 20px rgba(99,102,241,0.08) !important;
}

/* ── Badge breathe ── */
.badge-breathe {
    animation: badgeBreathe 3s ease-in-out infinite;
}
@keyframes badgeBreathe {
    0%, 100% { box-shadow: 0 0 0 0 transparent; }
    50% { box-shadow: 0 0 12px rgba(129,140,248,0.15); }
}

/* ── Badge shake (expired) ── */
.badge-shake {
    animation: badgeShake 0.6s ease-in-out;
}
@keyframes badgeShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-3px); }
    40% { transform: translateX(3px); }
    60% { transform: translateX(-2px); }
    80% { transform: translateX(2px); }
}

/* ── QR glow ring ── */
.qr-glow-ring {
    box-shadow: 0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(99,102,241,0.15);
    animation: qrGlow 3s ease-in-out infinite;
}
@keyframes qrGlow {
    0%, 100% { box-shadow: 0 8px 40px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.1); }
    50% { box-shadow: 0 8px 40px rgba(0,0,0,0.4), 0 0 80px rgba(99,102,241,0.2); }
}

/* ── Token text shimmer ── */
.token-text {
    background: linear-gradient(90deg, #818cf8, #c084fc, #818cf8);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: tokenShimmer 3s linear infinite;
}
@keyframes tokenShimmer {
    to { background-position: 200% center; }
}

/* ── Text glow ── */
.text-glow {
    text-shadow: 0 0 20px rgba(129,140,248,0.2);
}

/* ── Live dot ── */
.live-dot {
    display: inline-block;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #22c55e;
    margin-right: 6px;
    vertical-align: middle;
    box-shadow: 0 0 8px rgba(34,197,94,0.6);
    animation: liveDot 2s ease-in-out infinite;
}
@keyframes liveDot {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(34,197,94,0.6); }
    50% { opacity: 0.4; box-shadow: 0 0 4px rgba(34,197,94,0.3); }
}

/* ── Counter badge ── */
.counter-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(99,102,241,0.12);
    color: #818cf8;
    border: 1px solid rgba(99,102,241,0.2);
    transition: all 0.3s ease;
}
.counter-badge-num {
    display: inline-block;
    animation: countPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes countPop {
    from { transform: scale(1.4); }
    to { transform: scale(1); }
}

/* ── Attendee row hover ── */
.attendee-row {
    position: relative;
    overflow: hidden;
}
.attendee-row::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #4ade80, #22c55e);
    transform: scaleY(0);
    transition: transform 0.3s ease;
    border-radius: 2px;
}
.attendee-row:hover::before {
    transform: scaleY(1);
}
.attendee-row:hover {
    background: rgba(255,255,255,0.06) !important;
    border-color: rgba(255,255,255,0.1) !important;
    padding-left: 1.25rem !important;
}

/* ── Responsive ── */
@media (max-width: 768px) {
    div[style*="gridTemplateColumns"] {
        grid-template-columns: 1fr !important;
    }
}
`;
