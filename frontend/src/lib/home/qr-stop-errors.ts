export function normalizeStopSessionErrorMessage(rawMessage: string): string {
  const normalized = rawMessage.toLowerCase();
  if (
    normalized.includes("unknown_endpoint") &&
    normalized.includes("presence/qr/stop")
  ) {
    return "Gagal menghentikan sesi: backend belum mendukung endpoint stop. Minta deploy backend terbaru.";
  }
  return `Gagal menghentikan sesi: ${rawMessage}`;
}
