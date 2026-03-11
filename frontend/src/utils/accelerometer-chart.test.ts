import { describe, expect, it } from "vitest";
import {
  createInitialTelemetryChartGovernor,
  TELEMETRY_CHART_MAX_POINTS,
  TELEMETRY_CHART_FRAME_INTERVAL_STEPS,
  appendSampleToHistory,
  appendSamplesToHistory,
  buildTelemetryChartSeries,
  shouldCommitTelemetryChartFrame,
  updateTelemetryChartGovernor,
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

  it("appends batched samples in order and keeps rolling window", () => {
    const baseTs = 1700000000000;
    const history = Array.from({ length: 4 }, (_, index) => ({
      t: new Date(baseTs + index * 1000).toISOString(),
      x: index,
      y: index + 10,
      z: index + 20,
    }));

    const next = appendSamplesToHistory(
      history,
      [
        { t: new Date(baseTs + 4000).toISOString(), x: 4, y: 14, z: 24 },
        { t: new Date(baseTs + 5000).toISOString(), x: 5, y: 15, z: 25 },
      ],
      5,
    );

    expect(next).toHaveLength(5);
    expect(next[0]?.x).toBe(1);
    expect(next[4]?.x).toBe(5);
    expect(next.map((item) => item.t)).toEqual([
      new Date(baseTs + 1000).toISOString(),
      new Date(baseTs + 2000).toISOString(),
      new Date(baseTs + 3000).toISOString(),
      new Date(baseTs + 4000).toISOString(),
      new Date(baseTs + 5000).toISOString(),
    ]);
  });

  it("commits chart frames by cadence interval instead of each sample", () => {
    expect(shouldCommitTelemetryChartFrame(1000, null, 200)).toBe(true);
    expect(shouldCommitTelemetryChartFrame(1100, 1000, 200)).toBe(false);
    expect(shouldCommitTelemetryChartFrame(1200, 1000, 200)).toBe(true);
    expect(shouldCommitTelemetryChartFrame(1300, 1000, 0)).toBe(true);
  });

  it("governor upshifts interval when rendering overload persists", () => {
    let governor = createInitialTelemetryChartGovernor();

    governor = updateTelemetryChartGovernor(governor, 15);
    governor = updateTelemetryChartGovernor(governor, 15);

    expect(governor.intervalMs).toBe(TELEMETRY_CHART_FRAME_INTERVAL_STEPS[1]);
  });

  it("governor downshifts interval when rendering recovers", () => {
    let governor = createInitialTelemetryChartGovernor();

    for (let index = 0; index < 6; index += 1) {
      governor = updateTelemetryChartGovernor(governor, 20);
    }
    expect(governor.intervalMs).toBe(TELEMETRY_CHART_FRAME_INTERVAL_STEPS[2]);

    for (let index = 0; index < 9; index += 1) {
      governor = updateTelemetryChartGovernor(governor, 2);
    }
    expect(governor.intervalMs).toBe(TELEMETRY_CHART_FRAME_INTERVAL_STEPS[1]);
  });
});
