import type { AccelerometerSample } from "@/services/accelerometer-service";

export type TelemetryChartPoint = {
  x: number;
  y: number | null;
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
export const TELEMETRY_CHART_GAP_THRESHOLD_MS = 3000;

export type TelemetryChartGovernorState = {
  intervalMs: number;
  avgRenderCostMs: number;
  overloadStreak: number;
  recoveryStreak: number;
};

function toTimestamp(value: string) {
  const parsed = new Date(value).getTime();
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

type SortedTelemetrySample = {
  sample: AccelerometerSample;
  timestamp: number;
};

function buildSortedTelemetrySamples(history: AccelerometerSample[]) {
  return history
    .map((sample) => {
      const timestamp = toTimestamp(sample.t);
      if (timestamp === null) {
        return null;
      }
      return {
        sample,
        timestamp,
      } satisfies SortedTelemetrySample;
    })
    .filter((item): item is SortedTelemetrySample => item !== null)
    .sort((left, right) => left.timestamp - right.timestamp);
}

function buildPointsWithGaps(
  sortedSamples: SortedTelemetrySample[],
  pickValue: (sample: AccelerometerSample) => number,
) {
  const points: TelemetryChartPoint[] = [];

  for (let index = 0; index < sortedSamples.length; index += 1) {
    const current = sortedSamples[index];
    if (!current) {
      continue;
    }

    const previous = index > 0 ? sortedSamples[index - 1] : null;
    if (
      previous &&
      current.timestamp - previous.timestamp > TELEMETRY_CHART_GAP_THRESHOLD_MS
    ) {
      points.push({
        x: Math.round((previous.timestamp + current.timestamp) / 2),
        y: null,
      });
    }

    points.push({
      x: current.timestamp,
      y: pickValue(current.sample),
    });
  }

  return points;
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
  const sortedSamples = buildSortedTelemetrySamples(history);

  return [
    {
      name: "X",
      data: buildPointsWithGaps(sortedSamples, (sample) => sample.x),
    },
    {
      name: "Y",
      data: buildPointsWithGaps(sortedSamples, (sample) => sample.y),
    },
    {
      name: "Z",
      data: buildPointsWithGaps(sortedSamples, (sample) => sample.z),
    },
  ];
}
