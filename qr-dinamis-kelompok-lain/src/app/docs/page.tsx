"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { BASE_URL } from "../config";

const STORAGE_KEY = "swagger-gas-url";

export default function DocsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const swaggerRef = useRef<unknown>(null);
    const [gasUrl, setGasUrl] = useState("");
    const [savedUrl, setSavedUrl] = useState("");
    const [status, setStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");

    // Load saved URL on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) || BASE_URL || "";
        setGasUrl(stored);
        setSavedUrl(stored);
        if (stored) setStatus("ok");
    }, []);

    // Initialize Swagger UI
    useEffect(() => {
        // Load Swagger UI CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css";
        document.head.appendChild(link);

        // Load Swagger UI JS
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js";
        script.onload = () => {
            initSwagger();
        };
        document.body.appendChild(script);

        return () => {
            try { document.head.removeChild(link); } catch { /* ignore */ }
            try { document.body.removeChild(script); } catch { /* ignore */ }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initSwagger = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SwaggerUIBundle = (window as any).SwaggerUIBundle;
        if (!SwaggerUIBundle) return;

        const currentGasUrl = localStorage.getItem(STORAGE_KEY) || BASE_URL || "";

        const ui = SwaggerUIBundle({
            url: "/swagger.yaml",
            dom_id: "#swagger-ui",
            presets: [
                SwaggerUIBundle.presets.apis,
            ],
            layout: "BaseLayout",
            deepLinking: true,
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
            // Request interceptor: inject gasUrl into proxy requests
            requestInterceptor: (request: { url: string }) => {
                if (currentGasUrl) {
                    const separator = request.url.includes("?") ? "&" : "?";
                    request.url = request.url + separator + "gasUrl=" + encodeURIComponent(currentGasUrl);
                }
                return request;
            },
        });

        swaggerRef.current = ui;
    }, []);

    const handleSaveUrl = async () => {
        const trimmed = gasUrl.trim();
        if (!trimmed) {
            setStatus("error");
            return;
        }

        setStatus("testing");
        localStorage.setItem(STORAGE_KEY, trimmed);
        setSavedUrl(trimmed);

        // Test the connection via proxy
        try {
            const res = await fetch(`/api/proxy?gasUrl=${encodeURIComponent(trimmed)}`);
            const data = await res.json();
            if (data.ok) {
                setStatus("ok");
                // Re-initialize Swagger UI with new URL
                initSwagger();
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    const handleClearUrl = () => {
        setGasUrl("");
        setSavedUrl("");
        localStorage.removeItem(STORAGE_KEY);
        setStatus("idle");
    };

    return (
        <div style={{ background: "#1a1a2e", minHeight: "100vh" }}>
            {/* Header */}
            <div
                style={{
                    padding: "1rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <Link
                    href="/"
                    className="btn-secondary"
                    style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.85rem",
                        textDecoration: "none",
                    }}
                >
                    ← Kembali
                </Link>
                <span className="badge badge-neutral">📄 API Documentation</span>
            </div>

            {/* GAS URL Configuration Panel */}
            <div style={{
                maxWidth: 1100,
                margin: "0 auto",
                padding: "1.5rem 1rem 0",
            }}>
                <div style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "1.25rem 1.5rem",
                    marginBottom: "1rem",
                }}>
                    {/* Title Row */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.75rem",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "1.25rem" }}>🔗</span>
                            <h3 style={{
                                color: "#eef0f6",
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                margin: 0,
                            }}>
                                Google Apps Script URL
                            </h3>
                        </div>
                        {/* Status Badge */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            background: status === "ok" ? "rgba(34,197,94,0.15)"
                                : status === "error" ? "rgba(239,68,68,0.15)"
                                    : status === "testing" ? "rgba(234,179,8,0.15)"
                                        : "rgba(148,163,184,0.15)",
                            color: status === "ok" ? "#22c55e"
                                : status === "error" ? "#ef4444"
                                    : status === "testing" ? "#eab308"
                                        : "#94a3b8",
                            border: `1px solid ${status === "ok" ? "rgba(34,197,94,0.3)"
                                    : status === "error" ? "rgba(239,68,68,0.3)"
                                        : status === "testing" ? "rgba(234,179,8,0.3)"
                                            : "rgba(148,163,184,0.2)"
                                }`,
                        }}>
                            <span style={{ fontSize: "0.65rem" }}>
                                {status === "ok" ? "●" : status === "error" ? "●" : status === "testing" ? "◌" : "○"}
                            </span>
                            {status === "ok" ? "Terhubung"
                                : status === "error" ? "Gagal"
                                    : status === "testing" ? "Testing..."
                                        : "Belum dikonfigurasi"}
                        </div>
                    </div>

                    {/* Description */}
                    <p style={{
                        color: "#94a3b8",
                        fontSize: "0.8rem",
                        margin: "0 0 0.75rem",
                        lineHeight: 1.5,
                    }}>
                        Masukkan URL deployment GAS Anda agar Swagger UI dapat melakukan testing endpoint secara langsung.
                        Format: <code style={{
                            background: "rgba(255,255,255,0.08)",
                            padding: "0.1rem 0.35rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            color: "#818cf8",
                        }}>https://script.google.com/macros/s/&#123;ID&#125;/exec</code>
                    </p>

                    {/* URL Input Row */}
                    <div style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "stretch",
                    }}>
                        <input
                            type="url"
                            value={gasUrl}
                            onChange={(e) => setGasUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveUrl()}
                            placeholder="https://script.google.com/macros/s/AKfycby.../exec"
                            style={{
                                flex: 1,
                                background: "rgba(0,0,0,0.3)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "8px",
                                padding: "0.6rem 0.85rem",
                                color: "#eef0f6",
                                fontSize: "0.85rem",
                                fontFamily: "monospace",
                                outline: "none",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                        />
                        <button
                            onClick={handleSaveUrl}
                            disabled={status === "testing"}
                            style={{
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "0.6rem 1.25rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                cursor: status === "testing" ? "wait" : "pointer",
                                opacity: status === "testing" ? 0.7 : 1,
                                whiteSpace: "nowrap",
                                transition: "opacity 0.2s, transform 0.1s",
                            }}
                        >
                            {status === "testing" ? "⏳ Testing..." : "🚀 Set & Test"}
                        </button>
                        {savedUrl && (
                            <button
                                onClick={handleClearUrl}
                                style={{
                                    background: "rgba(239,68,68,0.15)",
                                    color: "#ef4444",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    borderRadius: "8px",
                                    padding: "0.6rem 0.85rem",
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                }}
                                title="Hapus URL"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Current saved URL display */}
                    {savedUrl && status === "ok" && (
                        <div style={{
                            marginTop: "0.6rem",
                            padding: "0.4rem 0.75rem",
                            background: "rgba(34,197,94,0.08)",
                            border: "1px solid rgba(34,197,94,0.15)",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                            fontFamily: "monospace",
                            wordBreak: "break-all",
                        }}>
                            ✅ Aktif: <span style={{ color: "#22c55e" }}>{savedUrl}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Swagger UI container */}
            <div
                ref={containerRef}
                id="swagger-ui"
                style={{
                    maxWidth: 1100,
                    margin: "0 auto",
                    padding: "1rem 1rem 2rem",
                }}
            />

            {/* Override Swagger UI styles for dark mode */}
            <style>{`
        .swagger-ui { font-family: var(--font-sans), system-ui, sans-serif !important; }
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #eef0f6 !important; }
        .swagger-ui .info .description p,
        .swagger-ui .info .description li { color: #94a3b8 !important; }
        .swagger-ui .info a { color: #818cf8 !important; }
        .swagger-ui .scheme-container { background: transparent !important; box-shadow: none !important; }
        .swagger-ui .opblock-tag { color: #eef0f6 !important; border-bottom-color: rgba(255,255,255,0.08) !important; }
        .swagger-ui .opblock .opblock-summary-description { color: #94a3b8 !important; }
        .swagger-ui .opblock .opblock-section-header { background: rgba(255,255,255,0.04) !important; }
        .swagger-ui .opblock .opblock-section-header h4 { color: #eef0f6 !important; }
        .swagger-ui table thead tr td, .swagger-ui table thead tr th { color: #94a3b8 !important; border-bottom-color: rgba(255,255,255,0.08) !important; }
        .swagger-ui .parameter__name { color: #eef0f6 !important; }
        .swagger-ui .parameter__type { color: #818cf8 !important; }
        .swagger-ui .response-col_status { color: #eef0f6 !important; }
        .swagger-ui .response-col_description { color: #94a3b8 !important; }
        .swagger-ui .model-title { color: #eef0f6 !important; }
        .swagger-ui .model { color: #94a3b8 !important; }
        .swagger-ui .prop-type { color: #818cf8 !important; }
        .swagger-ui .renderedMarkdown p { color: #94a3b8 !important; }
        .swagger-ui .btn { border-radius: 0.5rem !important; }
        .swagger-ui select { border-radius: 0.5rem !important; }
        .swagger-ui .opblock-body pre.microlight { background: rgba(0,0,0,0.3) !important; color: #e2e8f0 !important; border-radius: 0.5rem !important; }
        .swagger-ui .highlight-code > .microlight code { color: #e2e8f0 !important; }
        .swagger-ui textarea { background: rgba(0,0,0,0.3) !important; color: #eef0f6 !important; border-color: rgba(255,255,255,0.12) !important; border-radius: 0.5rem !important; }
        .swagger-ui input[type=text] { background: rgba(0,0,0,0.3) !important; color: #eef0f6 !important; border-color: rgba(255,255,255,0.12) !important; }
        .swagger-ui .responses-inner { background: transparent !important; }
        .swagger-ui .response-control-media-type__accept-message { color: #22c55e !important; }
        .swagger-ui .execute-wrapper .btn { background: linear-gradient(135deg, #6366f1, #8b5cf6) !important; border: none !important; color: white !important; }
      `}</style>
        </div>
    );
}
