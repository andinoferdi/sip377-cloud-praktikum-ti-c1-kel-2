import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

type StyledQrProps = {
  value: string;
  size?: number;
  className?: string;
  variant?: "default" | "compact";
  isExpired?: boolean;
  secondsLeft?: number;
  totalSeconds?: number;
};

const RING_ANIMATION = `
  @keyframes qr-pulse {
    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
    50%       { opacity: 0.12; transform: translate(-50%, -50%) scale(1.1); }
  }
  .qr-pulse { animation: qr-pulse 2.5s ease-in-out infinite; }
`;

function getStatusColor(secondsLeft: number | undefined, isExpired: boolean): string {
  if (isExpired) return "#9ca3af";
  if (secondsLeft === undefined) return "#10b981";
  if (secondsLeft < 15) return "#ef4444";
  if (secondsLeft < 30) return "#f59e0b";
  return "#10b981";
}

export default function StyledQr({
  value,
  size = 190,
  className,
  variant = "default",
  isExpired = false,
  secondsLeft,
  totalSeconds = 120,
}: StyledQrProps) {
  const hasRing = secondsLeft !== undefined;
  const progress = hasRing
    ? Math.max(0, Math.min(1, secondsLeft! / totalSeconds))
    : 1;

  const pad = variant === "compact" ? 10 : 14;
  const frameSize = size + pad * 2;
  const ringGap = variant === "compact" ? 10 : 14;
  const ringSize = frameSize + ringGap * 2;
  const cx = ringSize / 2;
  const cy = ringSize / 2;
  const radius = ringSize / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - progress);

  const color = getStatusColor(secondsLeft, isExpired);

  return (
    <>
      <style suppressHydrationWarning>{RING_ANIMATION}</style>

      <div
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: ringSize, height: ringSize }}
      >
        {/* Glow bloom */}
        {!isExpired && (
          <div
            className="qr-pulse pointer-events-none absolute rounded-full"
            aria-hidden="true"
            style={{
              width: frameSize + 40,
              height: frameSize + 40,
              background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
              left: "50%",
              top: "50%",
            }}
          />
        )}

        {/* Arc ring */}
        {hasRing && (
          <svg
            className="pointer-events-none absolute inset-0"
            width={ringSize}
            height={ringSize}
            viewBox={`0 0 ${ringSize} ${ringSize}`}
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              strokeWidth={2}
              stroke="rgba(148,163,184,0.15)"
            />
            <g transform={`rotate(-90 ${cx} ${cy})`}>
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                strokeWidth={2}
                stroke={color}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                style={{
                  transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
                  filter: isExpired ? "none" : `drop-shadow(0 0 3px ${color}80)`,
                }}
              />
            </g>
          </svg>
        )}

        {/* QR frame */}
        <div
          role="img"
          aria-label="QR code"
          className={cn(
            "relative inline-flex rounded-2xl",
            variant === "compact" ? "p-2.5" : "p-3.5"
          )}
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.20)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: isExpired
              ? "0 4px 24px -4px rgba(0,0,0,0.20)"
              : `0 8px 32px -8px rgba(0,0,0,0.30), 0 0 16px -4px ${color}30`,
          }}
        >
          {/* White surface */}
          <div
            className="relative overflow-hidden rounded-[14px]"
            style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(0,0,0,0.04)" }}
          >
            <QRCodeSVG
              value={value || " "}
              size={size}
              level="H"
              marginSize={4}
              fgColor={isExpired ? "#d1d5db" : "#0f172a"}
              bgColor="transparent"
            />

            {isExpired && (
              <div
                className="absolute inset-0 flex items-center justify-center rounded-[13px]"
                style={{ background: "rgba(255,255,255,0.75)" }}
              >
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: "rgba(239,68,68,0.90)",
                    color: "#fff",
                    boxShadow: "0 2px 10px rgba(239,68,68,0.40)",
                  }}
                >
                  Expired
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Seconds badge */}
        {hasRing && !isExpired && secondsLeft !== undefined && (
          <div
            className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums"
            aria-label={`${secondsLeft} seconds remaining`}
            style={{
              background: color,
              color: "#fff",
              boxShadow: `0 2px 8px ${color}60`,
            }}
          >
            {secondsLeft}s
          </div>
        )}
      </div>
    </>
  );
}