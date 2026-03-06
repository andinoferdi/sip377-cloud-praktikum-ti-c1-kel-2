"use client";

import { useState } from "react";
import { collectAndSendAccelFor } from "@/utils/accelerometer-collector";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";

interface AccelTestCompProps {
  deviceId: string;
  durationSeconds?: number;
}

export function AccelTestComp({
  deviceId,
  durationSeconds = 5,
}: AccelTestCompProps) {
  const [isCollecting, setIsCollecting] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "collecting" | "success" | "error">(
    "idle"
  );

  const addMessage = (msg: string) => {
    setMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSendData = async () => {
    if (!deviceId) {
      addMessage("❌ Device ID tidak tersedia");
      return;
    }

    setIsCollecting(true);
    setStatus("collecting");
    setMessages([]);
    addMessage(`Mulai mengumpulkan data selama ${durationSeconds}s...`);

    try {
      const response = await collectAndSendAccelFor(
        deviceId,
        durationSeconds * 1000,
        addMessage
      );

      if (response.ok) {
        setStatus("success");
        addMessage(`✅ Berhasil mengirim (${response.data?.accepted || 0} sampel)`);
      } else {
        setStatus("error");
        addMessage(`❌ Error: ${response.error}`);
      }
    } catch (error) {
      setStatus("error");
      addMessage(`❌ Exception: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className="rounded-lg border border-(--token-gray-300) bg-(--token-white-90) p-4 shadow-sm dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle)">
      <h3 className="mb-3 text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
        🧪 Test Accelerometer
      </h3>

      <div className="mb-4 rounded-md bg-(--token-gray-100) p-2 dark:bg-(--color-surface-dark-muted)">
        <p className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
          Device ID
        </p>
        <p className="font-mono text-sm font-medium text-(--token-gray-900) dark:text-(--token-white)">
          {deviceId || "—"}
        </p>
      </div>

      <button
        onClick={handleSendData}
        disabled={isCollecting || !deviceId}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50 dark:hover:opacity-90"
      >
        <Send size={16} />
        {isCollecting ? `Mengumpulkan (${durationSeconds}s)...` : "Kirim Data Accel"}
      </button>

      {/* Status Indicator */}
      {status === "success" && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 size={16} />
          Data Terkirim
        </div>
      )}

      {status === "error" && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle size={16} />
          Ada Error
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="rounded-md border border-(--token-gray-300) bg-(--token-gray-50) p-3 font-mono text-xs text-(--token-gray-600) dark:border-(--token-gray-600) dark:bg-(--token-gray-900) dark:text-(--token-gray-300)">
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className="whitespace-pre-wrap break-words">
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
