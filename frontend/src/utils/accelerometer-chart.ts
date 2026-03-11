import type { AccelerometerSample } from "@/services/accelerometer-service";

export type TelemetryChartPoint = {
  x: number;
  y: number;
};

export type TelemetryChartSeries = {
  name: "X" | "Y" | "Z";
  data: TelemetryChartPoint[];
};

export const TELEMETRY_CHART_MAX_POINTS = 90;
export const TELEMETRY_CHART_MOBILE_MAX_POINTS = 54;
export const TELEMETRY_CHART_FRAME_INTERVAL_STEPS = [16, 24, 33, 50] as const;
export const TELEMETRY_CHART_GOVERNOR_UPSHIFT_STREAK = 2;
export const TELEMETRY_CHART_GOVERNOR_DOWNSHIFT_STREAK = 8;
export const TELEMETRY_CHART_GOVERNOR_OVERLOAD_RATIO = 0.7;
export const TELEMETRY_CHART_GOVERNOR_RECOVERY_RATIO = 0.45;

export type TelemetryChartGovernorState = {
  intervalMs: number;
  avgRenderCostMs: number;
  overloadStreak: number;
  recoveryStreak: number;
};

function toTimestamp(value: string) {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

export function appendSampleToHistory(
  history: AccelerometerSample[],
  sample: AccelerometerSample,
  maxPoints = TELEMETRY_CHART_MAX_POINTS,
) {
  const nextHistory = [...history, sample];
  if (nextHistory.length <= maxPoints) {
    return nextHistory;
  }
  return nextHistory.slice(nextHistory.length - maxPoints);
}

export function appendSamplesToHistory(
  history: AccelerometerSample[],
  samples: AccelerometerSample[],
  maxPoints = TELEMETRY_CHART_MAX_POINTS,
) {
  if (samples.length === 0) {
    return history;
  }
  const nextHistory = [...history, ...samples];
  if (nextHistory.length <= maxPoints) {
    return nextHistory;
  }
  return nextHistory.slice(nextHistory.length - maxPoints);
}

export function shouldCommitTelemetryChartFrame(
  nowMs: number,
  lastCommitMs: number | null,
  intervalMs: number,
) {
  if (intervalMs <= 0 || lastCommitMs === null) {
    return true;
  }
  return nowMs - lastCommitMs >= intervalMs;
}

export function createInitialTelemetryChartGovernor(): TelemetryChartGovernorState {
  return {
    intervalMs: TELEMETRY_CHART_FRAME_INTERVAL_STEPS[0],
    avgRenderCostMs: 0,
    overloadStreak: 0,
    recoveryStreak: 0,
  };
}

export function updateTelemetryChartGovernor(
  previous: TelemetryChartGovernorState,
  renderCostMs: number,
): TelemetryChartGovernorState {
  const safeRenderCost = Number.isFinite(renderCostMs) && renderCostMs >= 0 ? renderCostMs : 0;
  const avgRenderCostMs =
    previous.avgRenderCostMs === 0
      ? safeRenderCost
      : previous.avgRenderCostMs * 0.75 + safeRenderCost * 0.25;

  const currentIndex = TELEMETRY_CHART_FRAME_INTERVAL_STEPS.indexOf(
    previous.intervalMs as (typeof TELEMETRY_CHART_FRAME_INTERVAL_STEPS)[number],
  );
  const intervalIndex = currentIndex >= 0 ? currentIndex : 0;
  const overloadThreshold = previous.intervalMs * TELEMETRY_CHART_GOVERNOR_OVERLOAD_RATIO;
  const recoveryThreshold = previous.intervalMs * TELEMETRY_CHART_GOVERNOR_RECOVERY_RATIO;

  if (avgRenderCostMs > overloadThreshold) {
    const nextOverloadStreak = previous.overloadStreak + 1;
    const canUpshift = intervalIndex < TELEMETRY_CHART_FRAME_INTERVAL_STEPS.length - 1;
    if (canUpshift && nextOverloadStreak >= TELEMETRY_CHART_GOVERNOR_UPSHIFT_STREAK) {
      return {
        intervalMs: TELEMETRY_CHART_FRAME_INTERVAL_STEPS[intervalIndex + 1],
        avgRenderCostMs,
        overloadStreak: 0,
        recoveryStreak: 0,
      };
    }

    return {
      intervalMs: previous.intervalMs,
      avgRenderCostMs,
      overloadStreak: nextOverloadStreak,
      recoveryStreak: 0,
    };
  }

  if (avgRenderCostMs < recoveryThreshold) {
    const nextRecoveryStreak = previous.recoveryStreak + 1;
    const canDownshift = intervalIndex > 0;
    if (canDownshift && nextRecoveryStreak >= TELEMETRY_CHART_GOVERNOR_DOWNSHIFT_STREAK) {
      return {
        intervalMs: TELEMETRY_CHART_FRAME_INTERVAL_STEPS[intervalIndex - 1],
        avgRenderCostMs,
        overloadStreak: 0,
        recoveryStreak: 0,
      };
    }

    return {
      intervalMs: previous.intervalMs,
      avgRenderCostMs,
      overloadStreak: 0,
      recoveryStreak: nextRecoveryStreak,
    };
  }

  return {
    intervalMs: previous.intervalMs,
    avgRenderCostMs,
    overloadStreak: 0,
    recoveryStreak: 0,
  };
}

export function buildTelemetryChartSeries(
  history: AccelerometerSample[],
): TelemetryChartSeries[] {
  return [
    {
      name: "X",
      data: history.map((sample) => ({
        x: toTimestamp(sample.t),
        y: sample.x,
      })),
    },
    {
      name: "Y",
      data: history.map((sample) => ({
        x: toTimestamp(sample.t),
        y: sample.y,
      })),
    },
    {
      name: "Z",
      data: history.map((sample) => ({
        x: toTimestamp(sample.t),
        y: sample.z,
      })),
    },
  ];
}
