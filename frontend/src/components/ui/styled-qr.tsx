import { memo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

type StyledQrProps = {
  value: string;
  size?: number;
  className?: string;
  variant?: "default" | "compact";
  renderMode?: "default" | "stable";
  isExpired?: boolean;
  secondsLeft?: number;
  totalSeconds?: number;
};

function getStatusColor(secondsLeft: number | undefined, isExpired: boolean): string {
  if (isExpired) return "#9ca3af";
  if (secondsLeft === undefined) return "#10b981";
  if (secondsLeft < 15) return "#ef4444";
  if (secondsLeft < 30) return "#f59e0b";
  return "#10b981";
}

type QrStaticFrameProps = {
  value: string;
  size: number;
  variant: "default" | "compact";
  isExpired: boolean;
  color: string;
  renderMode: "default" | "stable";
};

const QrStaticFrame = memo(function QrStaticFrame({
  value,
  size,
  variant,
  isExpired,
  color,
  renderMode,
}: QrStaticFrameProps) {
  const isStable = renderMode === "stable";
  return (
    <div
      role="img"
      aria-label="QR code"
      className={cn(
        "relative inline-flex rounded-2xl",
        variant === "compact" ? "p-2.5" : "p-3.5",
      )}
      style={{
        background: "rgba(255,255,255,0.10)",
        border: "1px solid rgba(255,255,255,0.20)",
        backdropFilter: isStable ? "blur(8px)" : "blur(12px)",
        WebkitBackdropFilter: isStable ? "blur(8px)" : "blur(12px)",
        boxShadow: isExpired
          ? "0 4px 24px -4px rgba(0,0,0,0.20)"
          : isStable
            ? "0 6px 18px -8px rgba(0,0,0,0.35)"
            : `0 8px 32px -8px rgba(0,0,0,0.30), 0 0 16px -4px ${color}30`,
      }}
    >
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
  );
});

export default function StyledQr({
  value,
  size = 190,
  className,
  variant = "default",
  renderMode = "default",
  isExpired = false,
  secondsLeft,
  totalSeconds = 120,
}: StyledQrProps) {
  const isStable = renderMode === "stable";
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
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: ringSize, height: ringSize }}
    >
      {!isExpired && (
        <div
          className={cn("pointer-events-none absolute rounded-full", !isStable && "qr-pulse")}
          aria-hidden="true"
          style={{
            width: frameSize + 40,
            height: frameSize + 40,
            opacity: isStable ? 0.18 : undefined,
            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

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
                filter: isExpired || isStable ? "none" : `drop-shadow(0 0 3px ${color}80)`,
              }}
            />
          </g>
        </svg>
      )}

      <QrStaticFrame
        value={value}
        size={size}
        variant={variant}
        isExpired={isExpired}
        color={color}
        renderMode={renderMode}
      />

      {hasRing && !isExpired && secondsLeft !== undefined && (
        <div
          className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums"
          aria-label={`${secondsLeft} seconds remaining`}
          style={{
            background: color,
            color: "#fff",
            boxShadow: isStable ? "none" : `0 2px 8px ${color}60`,
          }}
        >
          {secondsLeft}s
        </div>
      )}
    </div>
  );
}
