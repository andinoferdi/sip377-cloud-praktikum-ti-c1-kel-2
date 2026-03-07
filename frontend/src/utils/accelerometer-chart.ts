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
