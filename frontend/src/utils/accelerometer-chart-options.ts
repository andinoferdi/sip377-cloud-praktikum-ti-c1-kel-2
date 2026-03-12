import type { ApexOptions } from "apexcharts";

export const TELEMETRY_RECEIVER_Y_MIN = -1;
export const TELEMETRY_RECEIVER_Y_MAX = 1;
export const TELEMETRY_RECEIVER_Y_TICK_AMOUNT = 4;

type BuildTelemetryChartOptionsArgs = {
  isLive: boolean;
  isMobileLive: boolean;
  isPerformanceCapped: boolean;
  lockYAxis: boolean;
};

const SERIES_COLORS = ["#2ea8ff", "#22c55e", "#f59e0b"] as const;

export function buildTelemetryChartOptions({
  isLive,
  isMobileLive,
  isPerformanceCapped,
  lockYAxis,
}: BuildTelemetryChartOptionsArgs): ApexOptions {
  return {
    chart: {
      type: "line",
      height: "100%",
      toolbar: { show: false },
      zoom: { enabled: false },
      redrawOnParentResize: false,
      redrawOnWindowResize: false,
      parentHeightOffset: 0,
      animations: {
        enabled: !isMobileLive,
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
      show: !isMobileLive || !isPerformanceCapped,
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
      min: lockYAxis ? TELEMETRY_RECEIVER_Y_MIN : undefined,
      max: lockYAxis ? TELEMETRY_RECEIVER_Y_MAX : undefined,
      tickAmount: lockYAxis ? TELEMETRY_RECEIVER_Y_TICK_AMOUNT : undefined,
      forceNiceScale: lockYAxis ? false : undefined,
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
      enabled: !isMobileLive || !isPerformanceCapped,
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
  };
}
