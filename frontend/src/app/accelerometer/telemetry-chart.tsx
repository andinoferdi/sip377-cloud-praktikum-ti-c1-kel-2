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
};

const SERIES_COLORS = ["#2ea8ff", "#22c55e", "#f59e0b"] as const;

export default function TelemetryChart({
  history,
  isLive,
}: TelemetryChartProps) {
  const series = useMemo(() => buildTelemetryChartSeries(history), [history]);

  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: "line",
        height: 320,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: "linear",
          dynamicAnimation: {
            speed: 260,
          },
        },
      },
      colors: [...SERIES_COLORS],
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 2.5,
      },
      markers: {
        size: 0,
        hover: {
          sizeOffset: 3,
        },
      },
      legend: {
        show: true,
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
        strokeDashArray: 4,
      },
      tooltip: {
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
    [isLive],
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
