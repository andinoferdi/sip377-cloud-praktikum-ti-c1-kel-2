"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function FloatingParticles() {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 12,
    }));
    setParticles(generated);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="landing-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function StepCard({
  step, icon, title, desc, delay,
}: {
  step: string; icon: string; title: string; desc: string; delay: string;
}) {
  return (
    <div
      className="fade-in landing-step-card"
      style={{ animationDelay: delay }}
    >
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#818cf8", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
        {step}
      </div>
      <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{icon}</div>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#eef0f6", marginBottom: "0.4rem" }}>{title}</h3>
      <p style={{ fontSize: "0.8rem", lineHeight: 1.5, color: "#64748b" }}>{desc}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{
      position: "relative", minHeight: "100vh", overflow: "hidden",
      background: "#06060f",
    }}>
      {/* Mesh background */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 80% 100%, rgba(139,92,246,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 10% 60%, rgba(59,130,246,0.06) 0%, transparent 60%)`,
      }} />

      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: `linear-gradient(rgba(129,140,248,0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(129,140,248,0.5) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      <FloatingParticles />

      {/* Glow orbs */}
      <div className="glow-orb" style={{ width: 500, height: 500, top: "-15%", left: "-10%", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />
      <div className="glow-orb" style={{ width: 400, height: 400, bottom: "-10%", right: "-8%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", animationDelay: "3s" }} />
      <div className="glow-orb" style={{ width: 300, height: 300, top: "40%", right: "15%", background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", animationDelay: "6s" }} />

      <main style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Navigation */}
        <nav className="fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              color: "#fff", boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <circle cx="17.5" cy="17.5" r="3.5" />
              </svg>
            </div>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#eef0f6", letterSpacing: "-0.02em" }}>PresensiQR</span>
          </div>
          <Link href="/docs" className="landing-nav-link" style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 500,
            color: "#818cf8", textDecoration: "none",
            border: "1px solid rgba(99,102,241,0.2)", borderRadius: "0.6rem",
            background: "rgba(99,102,241,0.06)", transition: "all 0.25s ease",
          }}>
            📄 API Docs
          </Link>
        </nav>

        {/* Hero Section */}
        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "5rem 0 3rem", flex: 1 }}>
          <div className="fade-in" style={{ animationDelay: "0.1s" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.45rem 1rem", borderRadius: 9999, fontSize: "0.8rem",
              fontWeight: 500, color: "#818cf8",
              background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
              marginBottom: "1.75rem", backdropFilter: "blur(10px)",
            }}>
              <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.6)", display: "inline-block" }} />
              Praktik Komputasi Awan — Kelompok 3
            </span>
          </div>

          <h1 className="fade-in" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800, lineHeight: 1.1, color: "#eef0f6", letterSpacing: "-0.03em", marginBottom: "1.25rem", marginTop: "1.5rem", animationDelay: "0.2s" }}>
            Presensi{" "}
            <span style={{
              background: "linear-gradient(135deg, #818cf8, #a78bfa 40%, #c084fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              QR Dinamis
            </span>
          </h1>

          <p className="fade-in" style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "#64748b", maxWidth: 500, marginBottom: "3rem", animationDelay: "0.3s" }}>
            Sistem presensi modern berbasis QR Code dinamis dengan teknologi cloud.
            <br />
            Cepat, aman, dan otomatis.
          </p>

          {/* Role Cards */}
          <div className="fade-in" style={{ display: "flex", gap: "1.25rem", width: "100%", maxWidth: 700, animationDelay: "0.4s" }}>
            {/* Admin Card */}
            <Link href="/admin" className="landing-role-card" style={{
              flex: 1, position: "relative", textDecoration: "none",
              borderRadius: "1rem", overflow: "hidden", transition: "all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
              border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(20px)",
            }}>
              <div className="card-glow-admin" style={{ position: "absolute", inset: 0, opacity: 0, transition: "opacity 0.4s ease", background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08), transparent 70%)" }} />
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "2rem 1.5rem", textAlign: "center" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 56, height: 56, borderRadius: 14,
                  background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                  color: "#818cf8", transition: "all 0.3s ease",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#eef0f6", letterSpacing: "-0.01em" }}>Admin / Dosen</h2>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#64748b" }}>
                    Generate QR Code untuk sesi kuliah dan pantau presensi mahasiswa secara real-time.
                  </p>
                </div>
                <div className="card-arrow" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
                  color: "#818cf8", transition: "all 0.3s ease",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Student Card */}
            <Link href="/student" className="landing-role-card" style={{
              flex: 1, position: "relative", textDecoration: "none",
              borderRadius: "1rem", overflow: "hidden", transition: "all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
              border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(20px)",
            }}>
              <div className="card-glow-student" style={{ position: "absolute", inset: 0, opacity: 0, transition: "opacity 0.4s ease", background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08), transparent 70%)" }} />
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "2rem 1.5rem", textAlign: "center" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 56, height: 56, borderRadius: 14,
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
                  color: "#10b981", transition: "all 0.3s ease",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#eef0f6", letterSpacing: "-0.01em" }}>Mahasiswa</h2>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#64748b" }}>
                    Scan QR Code untuk check-in otomatis dan cek status presensi kapan saja.
                  </p>
                </div>
                <div className="card-arrow" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)",
                  color: "#10b981", transition: "all 0.3s ease",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: "3rem 0 2rem" }}>
          <h2 className="fade-in" style={{
            textAlign: "center", fontSize: "1.1rem", fontWeight: 600,
            color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.15em",
            marginBottom: "2rem", animationDelay: "0.5s",
          }}>
            Cara Kerja
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <StepCard step="01" icon="🔑" title="Generate QR" desc="Dosen membuat QR Token unik untuk setiap sesi kuliah" delay="0.55s" />
            <StepCard step="02" icon="📷" title="Scan QR" desc="Mahasiswa scan QR Code yang ditampilkan di kelas" delay="0.65s" />
            <StepCard step="03" icon="✅" title="Check-in" desc="Presensi otomatis tercatat ke Google Sheets" delay="0.75s" />
          </div>
        </section>

        {/* Footer */}
        <footer className="fade-in" style={{ padding: "1.5rem 0 2rem", animationDelay: "0.8s" }}>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.12), transparent)", marginBottom: "1.5rem" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "0.8rem", color: "#475569" }}>
              Modul 1 — Versi A &middot; Google Apps Script + Google Sheets - Praktik Komputasi Awan — Kelompok 3
            </p>
            <Link href="/docs" style={{ fontSize: "0.8rem", fontWeight: 500, color: "#818cf8", textDecoration: "none", transition: "color 0.2s ease" }}>
              📄 API Documentation →
            </Link>
          </div>
        </footer>
      </main>

      {/* Styles */}
      <style>{`
        .landing-role-card:hover {
          transform: translateY(-6px) !important;
          border-color: rgba(99,102,241,0.25) !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(99,102,241,0.08) !important;
        }
        .landing-role-card:hover .card-glow-admin,
        .landing-role-card:hover .card-glow-student {
          opacity: 1 !important;
        }
        .landing-role-card:hover .card-arrow {
          background: linear-gradient(135deg, #6366f1, #818cf8) !important;
          border-color: transparent !important;
          color: #fff !important;
          transform: translateX(3px);
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }
        .landing-role-card {
          position: relative;
          overflow: hidden;
        }
        .landing-role-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(129,140,248,0.03), transparent);
          transition: left 0.6s ease;
        }
        .landing-role-card:hover::before {
          left: 100%;
        }
        .landing-step-card {
          position: relative;
          padding: 1.75rem 1.25rem;
          border-radius: 1rem;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          text-align: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .landing-step-card:hover {
          border-color: rgba(99,102,241,0.2) !important;
          background: rgba(255,255,255,0.05) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .landing-particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(129,140,248,0.25);
          box-shadow: 0 0 4px rgba(129,140,248,0.2);
          animation: particleFloat linear infinite;
        }
        .landing-nav-link:hover {
          border-color: rgba(99,102,241,0.4) !important;
          background: rgba(99,102,241,0.12) !important;
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(50px) scale(0.5); opacity: 0; }
        }
        @media (max-width: 640px) {
          .landing-role-card { flex-direction: column !important; }
          div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
