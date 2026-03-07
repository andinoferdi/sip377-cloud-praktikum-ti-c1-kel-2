import { describe, expect, it } from "vitest";
import {
  TELEMETRY_CHART_MAX_POINTS,
  appendSampleToHistory,
  buildTelemetryChartSeries,
} from "@/utils/accelerometer-chart";

describe("accelerometer-chart", () => {
  it("keeps only the newest points inside the rolling window", () => {
    const sample = { t: "2026-03-08T00:00:00.000Z", x: 0, y: 0, z: 0 };
    let history = Array.from({ length: TELEMETRY_CHART_MAX_POINTS }, (_, index) => ({
      ...sample,
      t: new Date(1700000000000 + index * 1000).toISOString(),
      x: index,
      y: index + 1,
      z: index + 2,
    }));

    history = appendSampleToHistory(history, {
      t: new Date(1800000000000).toISOString(),
      x: 999,
      y: 1000,
      z: 1001,
    });

    expect(history).toHaveLength(TELEMETRY_CHART_MAX_POINTS);
    expect(history.at(-1)?.x).toBe(999);
  });

  it("builds three chart series from telemetry history", () => {
    const series = buildTelemetryChartSeries([
      { t: "2026-03-08T00:00:00.000Z", x: 1, y: 2, z: 3 },
      { t: "2026-03-08T00:00:01.000Z", x: 4, y: 5, z: 6 },
    ]);

    expect(series).toHaveLength(3);
    expect(series[0]?.name).toBe("X");
    expect(series[1]?.data[1]?.y).toBe(5);
    expect(series[2]?.data[0]?.y).toBe(3);
  });
});
