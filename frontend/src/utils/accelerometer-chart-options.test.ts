import { describe, expect, it } from "vitest";
import {
  buildTelemetryChartOptions,
  TELEMETRY_RECEIVER_Y_MAX,
  TELEMETRY_RECEIVER_Y_MIN,
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
      forceNiceScale?: boolean;
    };
    expect(yaxis.min).toBe(TELEMETRY_RECEIVER_Y_MIN);
    expect(yaxis.max).toBe(TELEMETRY_RECEIVER_Y_MAX);
    expect(yaxis.forceNiceScale).toBe(false);
  });
});
