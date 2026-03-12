import { describe, expect, it } from "vitest";
import {
  buildTelemetryChartOptions,
  TELEMETRY_RECEIVER_Y_MAX,
  TELEMETRY_RECEIVER_Y_MIN,
  TELEMETRY_RECEIVER_Y_TICK_AMOUNT,
} from "@/utils/accelerometer-chart-options";

describe("accelerometer-chart-options", () => {
  it("locks y-axis range for receiver chart", () => {
    const options = buildTelemetryChartOptions({
      isLive: true,
      isMobileLive: false,
      isPerformanceCapped: false,
      lockYAxis: true,
    });

    const yaxis = options.yaxis as {
      min?: number;
      max?: number;
      tickAmount?: number;
      forceNiceScale?: boolean;
    };
    expect(yaxis.min).toBe(TELEMETRY_RECEIVER_Y_MIN);
    expect(yaxis.max).toBe(TELEMETRY_RECEIVER_Y_MAX);
    expect(yaxis.tickAmount).toBe(TELEMETRY_RECEIVER_Y_TICK_AMOUNT);
    expect(yaxis.forceNiceScale).toBe(false);
  });

  it("disables animations in receiver mode to avoid batch artifact", () => {
    const options = buildTelemetryChartOptions({
      isLive: true,
      isMobileLive: false,
      isPerformanceCapped: false,
      lockYAxis: true,
      disableAnimations: true,
    });

    const chart = options.chart as {
      animations?: {
        enabled?: boolean;
      };
    };

    expect(chart.animations?.enabled).toBe(false);
  });
});
