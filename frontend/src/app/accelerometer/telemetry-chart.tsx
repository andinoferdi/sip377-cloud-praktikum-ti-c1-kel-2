"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { buildTelemetryChartSeries } from "@/utils/accelerometer-chart";
import { buildTelemetryChartOptions } from "@/utils/accelerometer-chart-options";
import type { AccelerometerSample } from "@/services/accelerometer-service";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type TelemetryChartProps = {
  history: AccelerometerSample[];
  isLive: boolean;
  isMobileOptimized: boolean;
  isPerformanceCapped: boolean;
  lockYAxis?: boolean;
};

export default function TelemetryChart({
  history,
  isLive,
  isMobileOptimized,
  isPerformanceCapped,
  lockYAxis = false,
}: TelemetryChartProps) {
  const series = useMemo(() => buildTelemetryChartSeries(history), [history]);
  const isMobileLive = isMobileOptimized && isLive;

  const options = useMemo(
    () =>
      buildTelemetryChartOptions({
        isLive,
        isMobileLive,
        isPerformanceCapped,
        lockYAxis,
      }),
    [isLive, isMobileLive, isPerformanceCapped, lockYAxis],
  );

  return (
    <div className="h-[360px] rounded-2xl border border-soft bg-(--token-gray-50) p-3 dark:bg-(--token-white-5)">
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height="100%"
      />
    </div>
  );
}
