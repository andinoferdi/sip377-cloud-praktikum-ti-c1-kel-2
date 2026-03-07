import type { Metadata } from "next";
import SiteShell from "@/components/layout/site-shell";
import AccelerometerClient from "./telemetry-client";

export const metadata: Metadata = {
  title: "Accelerometer",
  description:
    "Modul 2 telemetry accelerometer realtime dengan sesi start dan stop.",
};

export default function AccelerometerPage() {
  return (
    <SiteShell>
      <AccelerometerClient />
    </SiteShell>
  );
}
