"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import { buildTelemetryChartSeries } from "@/utils/accelerometer-chart";
import type { AccelerometerSample } from "@/services/accelerometer-service";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type TelemetryChartProps = {
  history: AccelerometerSample[];
  isLive: boolean;
  isMobileOptimized: boolean;
};

const SERIES_COLORS = ["#2ea8ff", "#22c55e", "#f59e0b"] as const;

export default function TelemetryChart({
  history,
  isLive,
  isMobileOptimized,
}: TelemetryChartProps) {
  const series = useMemo(() => buildTelemetryChartSeries(history), [history]);
  const isMobileLive = isMobileOptimized && isLive;

  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: "line",
        height: 320,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: !isMobileLive,
          easing: "linear",
          dynamicAnimation: {
            speed: isMobileLive ? 1 : 260,
          },
        },
      },
      colors: [...SERIES_COLORS],
      dataLabels: { enabled: false },
      stroke: {
        curve: isMobileLive ? "straight" : "smooth",
        width: isMobileLive ? 2 : 2.5,
      },
      markers: {
        size: 0,
        hover: {
          sizeOffset: isMobileLive ? 0 : 3,
        },
      },
      legend: {
        show: !isMobileLive,
        position: "top",
        horizontalAlign: "left",
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false,
        },
      },
      yaxis: {
        decimalsInFloat: 2,
        labels: {
          formatter(value) {
            return value.toFixed(2);
          },
        },
      },
      grid: {
        strokeDashArray: isMobileLive ? 0 : 4,
      },
      tooltip: {
        enabled: !isMobileLive,
        theme: "light",
        x: {
          format: "HH:mm:ss",
        },
      },
      noData: {
        text: isLive
          ? "Menunggu sampel telemetry pertama..."
          : "Belum ada histori telemetry untuk divisualisasikan.",
        align: "center",
        verticalAlign: "middle",
      },
    }),
    [isLive, isMobileLive],
  );

  return (
    <div className="rounded-2xl border border-soft bg-(--token-gray-50) p-3 dark:bg-(--token-white-5)">
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={320}
      />
    </div>
  );
}
