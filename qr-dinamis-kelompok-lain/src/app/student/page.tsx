"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { loginStudent, type Student } from "../data/students";
import { ArrowLeft, LogOut, Camera, CameraOff, CheckCircle, XCircle, Loader2, ScanLine, User } from "lucide-react";

interface CheckinResult {
    presence_id: string;
    status: string;
    note?: string;
    course_id?: string;
    session_id?: string;
}

function StudentContent() {
    const searchParams = useSearchParams();

    // Auth
    const [loggedIn, setLoggedIn] = useState<Student | null>(null);
    const [loginNim, setLoginNim] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [deviceId, setDeviceId] = useState("");

    // Token from URL
    const [urlToken, setUrlToken] = useState("");
    const [pendingAutoCheckin, setPendingAutoCheckin] = useState(false);

    // Scanner
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef<unknown>(null);

    // Check-in
    const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null);
    const [checkinLoading, setCheckinLoading] = useState(false);
    const [checkinError, setCheckinError] = useState("");

    const extractToken = (text: string): string => {
        try {
            const url = new URL(text);
            return url.searchParams.get("token") || text;
        } catch {
            return text;
        }
    };

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            setUrlToken(token);
            setPendingAutoCheckin(true);
        }
    }, [searchParams]);

    useEffect(() => {
        const stored = localStorage.getItem("presensi_device_id");
        if (stored) {
            setDeviceId(stored);
        } else {
            const id = "dev-" + Math.random().toString(36).substring(2, 8);
            setDeviceId(id);
            localStorage.setItem("presensi_device_id", id);
        }
        const savedStudent = localStorage.getItem("presensi_student");
        if (savedStudent) {
            try { setLoggedIn(JSON.parse(savedStudent)); } catch { /* */ }
        }
    }, []);

    // Check-in — only needs user_id, device_id, qr_token (course/session from token)
    const doCheckin = useCallback(
        async (token: string, student: Student) => {
            if (!token.trim() || !student) return;
            setCheckinLoading(true);
            setCheckinError("");
            setCheckinResult(null);

            try {
                const res = await fetch("/api/proxy?path=presence/checkin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: student.nim,
                        device_id: deviceId,
                        qr_token: token,
                        ts: new Date().toISOString(),
                    }),
                });
                const json = await res.json();
                if (json.ok) {
                    setCheckinResult(json.data);
                    setPendingAutoCheckin(false);
                } else {
                    setCheckinError(json.error || "Gagal check-in");
                }
            } catch (err) {
                setCheckinError("Network error: " + (err as Error).message);
            } finally {
                setCheckinLoading(false);
            }
        },
        [deviceId]
    );

    // Auto check-in after login if URL has token
    useEffect(() => {
        if (loggedIn && pendingAutoCheckin && urlToken && !checkinResult) {
            doCheckin(urlToken, loggedIn);
        }
    }, [loggedIn, pendingAutoCheckin, urlToken, checkinResult, doCheckin]);

    const handleLogin = useCallback(() => {
        setLoginError("");
        const student = loginStudent(loginNim.trim(), loginPassword.trim());
        if (!student) {
            setLoginError("NIM atau password salah.");
            return;
        }
        setLoggedIn(student);
        localStorage.setItem("presensi_student", JSON.stringify(student));
    }, [loginNim, loginPassword]);

    const handleLogout = useCallback(() => {
        setLoggedIn(null);
        localStorage.removeItem("presensi_student");
        setCheckinResult(null);
        setCheckinError("");
        setPendingAutoCheckin(false);
        setUrlToken("");
    }, []);

    // Scanner
    const startScanner = useCallback(async () => {
        setCheckinError("");
        setCheckinResult(null);
        setScanning(true);
        try {
            const { Html5Qrcode } = await import("html5-qrcode");
            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;
            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText: string) => {
                    const token = extractToken(decodedText);
                    try { await scanner.stop(); } catch { /* */ }
                    setScanning(false);
                    scannerRef.current = null;
                    if (loggedIn) doCheckin(token, loggedIn);
                },
                () => { }
            );
        } catch (err) {
            setScanning(false);
            setCheckinError("Tidak bisa mengakses kamera: " + (err as Error).message);
        }
    }, [loggedIn, doCheckin]);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try { await (scannerRef.current as { stop: () => Promise<void> }).stop(); } catch { /* */ }
            scannerRef.current = null;
        }
        setScanning(false);
    }, []);

    // ---- LOGIN SCREEN ----
    if (!loggedIn) {
        return (
            <div className="bg-gradient-animated relative min-h-screen overflow-hidden">
                <main className="relative z-10 mx-auto max-w-md px-6 py-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 text-center"
                    >
                        <Link
                            href="/"
                            className="btn-secondary inline-flex items-center gap-2 mb-8 hover:!bg-opacity-80 transition-all shadow-md"
                            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", textDecoration: "none" }}
                        >
                            <ArrowLeft size={16} /> Kembali
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-center mb-8"
                    >
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl border border-green-500/20"
                            style={{ background: "rgba(34,197,94,0.15)", backdropFilter: "blur(8px)" }}
                        >
                            <ScanLine size={40} style={{ color: "var(--success)" }} />
                        </motion.div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                            Presensi Mahasiswa
                        </h1>
                        <p className="mt-3 text-sm font-medium" style={{ color: "var(--muted)" }}>
                            Masuk menggunakan akun Siakad Anda
                        </p>
                    </motion.div>

                    <AnimatePresence>
                        {urlToken && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="mb-6 overflow-hidden rounded-2xl border text-center shadow-lg"
                                style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.3)", backdropFilter: "blur(4px)" }}
                            >
                                <div className="p-4">
                                    <p className="text-sm font-semibold" style={{ color: "var(--accent-light)" }}>
                                        ✨ QR Code terdeteksi — login untuk otomatis check-in
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="glass-card p-8 shadow-2xl rounded-3xl border border-white/10 relative overflow-hidden"
                    >
                        {/* Shimmer effect */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-5 animate-shimmer" />

                        <div className="mb-5 relative z-10">
                            <label className="input-label font-semibold ml-1 text-sm tracking-wide">Nomor Induk Mahasiswa (NIM)</label>
                            <input
                                type="text"
                                className="input-field mt-1 transition-all duration-300 focus:scale-[1.02] focus:shadow-emerald-500/20 focus:shadow-lg"
                                value={loginNim}
                                onChange={(e) => setLoginNim(e.target.value)}
                                placeholder="Contoh: 434231xxx"
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            />
                        </div>
                        <div className="mb-6 relative z-10">
                            <label className="input-label font-semibold ml-1 text-sm tracking-wide">Password Siakad</label>
                            <input
                                type="password"
                                className="input-field mt-1 transition-all duration-300 focus:scale-[1.02] focus:shadow-emerald-500/20 focus:shadow-lg"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="Masukkan password"
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            />
                        </div>

                        <AnimatePresence>
                            {loginError && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="alert alert-error mb-5 shadow-lg border border-red-500/30 font-medium relative z-10"
                                >
                                    {loginError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base font-bold shadow-xl shadow-emerald-500/30 relative z-10"
                            onClick={handleLogin}
                        >
                            Login Sekarang
                        </motion.button>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="mt-8 text-center text-xs font-medium tracking-wide"
                        style={{ color: "var(--muted)" }}
                    >
                        Default: Password sama dengan NIM Anda
                    </motion.p>
                </main>
            </div>
        );
    }

    // ---- MAIN SCREEN ----
    return (
        <div className="bg-gradient-animated relative min-h-screen overflow-hidden">
            <main className="relative z-10 mx-auto max-w-2xl px-6 py-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-secondary flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-white/10"
                        onClick={handleLogout}
                        style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                    >
                        <LogOut size={16} /> Logout
                    </motion.button>
                    <span className="badge badge-neutral shadow-sm border border-white/10 px-3 py-1 bg-black/20 backdrop-blur-md">Portal Mahasiswa</span>
                </motion.div>

                {/* User info */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="mb-8 rounded-3xl p-5 flex items-center gap-5 shadow-xl border border-white/5"
                    style={{ background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(12px)" }}
                >
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner border border-green-500/20 relative"
                        style={{ background: "rgba(34,197,94,0.15)" }}
                    >
                        <User size={28} style={{ color: "var(--success)" }} />
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-slate-900"></span>
                        </span>
                    </motion.div>
                    <div>
                        <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">{loggedIn.nama}</p>
                        <p className="text-sm font-mono mt-0.5 tracking-wider" style={{ color: "var(--muted)" }}>NIM. {loggedIn.nim}</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="mb-2 text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-slate-700 drop-shadow-sm">
                        Check-in Presensi
                    </h1>
                    <p className="mb-8 text-sm font-medium leading-relaxed" style={{ color: "var(--muted)" }}>
                        Scan QR Code dari layar dosen untuk mencatat kehadiran Anda pada sesi perkuliahan hari ini.
                    </p>
                </motion.div>

                <AnimatePresence mode="popLayout">
                    {/* Loading */}
                    {checkinLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                            className="mb-8 rounded-3xl border p-8 text-center shadow-2xl relative overflow-hidden"
                            style={{ background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.4)", backdropFilter: "blur(8px)" }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="mx-auto mb-4 w-fit"
                            >
                                <Loader2 size={44} style={{ color: "var(--accent-light)" }} />
                            </motion.div>
                            <p className="font-bold text-lg" style={{ color: "var(--accent-light)" }}>Memproses Kehadiran...</p>
                            <p className="text-sm mt-1.5 opacity-80" style={{ color: "var(--accent-light)" }}>Verifikasi lokasi dan token kelas</p>
                        </motion.div>
                    )}

                    {/* Success */}
                    {checkinResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="alert alert-success mb-8 shadow-2xl border border-green-500/30 rounded-3xl p-6 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CheckCircle size={100} />
                            </div>
                            <div className="flex items-start gap-5 relative z-10">
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                    className="bg-green-500/20 p-2 rounded-2xl border border-green-500/30"
                                >
                                    <CheckCircle size={36} className="text-green-400" />
                                </motion.div>
                                <div>
                                    <p className="text-xl font-extrabold text-green-100 drop-shadow-md">Kehadiran Tercatat!</p>
                                    <p className="text-sm font-medium text-green-200/90 mt-1">{loggedIn.nama}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-green-900/60 border border-green-500/30 shadow-inner">
                                            <p className="text-xs font-mono text-green-300">
                                                ID: {checkinResult.presence_id.split('-')[0]}...
                                            </p>
                                        </div>
                                        {checkinResult.note === "already_checked_in" && (
                                            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-900/40 border border-blue-500/30 shadow-inner">
                                                <p className="text-xs font-semibold text-blue-300">Sudah absen sebelumnya</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Error */}
                    {checkinError && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="alert alert-error mb-8 shadow-2xl border border-red-500/30 rounded-3xl p-6"
                        >
                            <div className="flex items-start gap-4">
                                <motion.div
                                    initial={{ rotate: -90, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="bg-red-500/20 p-2 rounded-2xl border border-red-500/30"
                                >
                                    <XCircle size={32} className="text-red-400" />
                                </motion.div>
                                <div className="pt-1">
                                    <p className="text-lg font-bold text-red-100 drop-shadow-sm">Gagal Melakukan Check-in</p>
                                    <p className="text-sm font-medium text-red-200/90 mt-1.5 leading-relaxed">{checkinError}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scanner */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="glass-card mb-8 p-6 sm:p-8 shadow-2xl rounded-3xl border border-white/10"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="flex items-center gap-3 text-lg font-bold tracking-wide">
                            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
                                <Camera size={22} strokeWidth={2.5} />
                            </div>
                            Scan QR Code Dosen
                        </h2>
                        {scanning && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                                <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        <motion.div
                            layout
                            className="mb-6 overflow-hidden rounded-2xl shadow-inner bg-black/60 border border-white/5 relative"
                            style={{ minHeight: scanning ? 320 : 0, transition: "min-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
                        >
                            <div id="qr-reader" className="w-full h-full" />
                            {scanning && (
                                <div className="absolute inset-0 pointer-events-none border-2 border-indigo-500/30 rounded-2xl z-10" />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {!scanning ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base font-bold shadow-xl shadow-indigo-500/25 rounded-xl"
                            onClick={startScanner}
                        >
                            <Camera size={20} strokeWidth={2.5} /> Buka Scanner Kamera
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-secondary w-full flex items-center justify-center gap-3 py-4 text-base font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 rounded-xl"
                            onClick={stopScanner}
                        >
                            <CameraOff size={20} strokeWidth={2.5} /> Tutup Scanner
                        </motion.button>
                    )}

                    <p className="mt-5 text-sm font-medium text-center leading-relaxed" style={{ color: "var(--muted)" }}>
                        Arahkan kamera ke QR Code yang ditampilkan oleh dosen.<br className="hidden sm:block" /> Presensi Anda akan otomatis tercatat.
                    </p>
                </motion.div>
            </main>
        </div>
    );
}

export default function StudentPage() {
    return (
        <Suspense fallback={
            <div className="bg-gradient-animated min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin" style={{ color: "var(--muted)" }} />
            </div>
        }>
            <StudentContent />
        </Suspense>
    );
}
