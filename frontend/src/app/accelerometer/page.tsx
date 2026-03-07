import type { Metadata } from "next";
import AccelerometerClient from "@/app/accelerometer/accelerometer-client";
import SiteShell from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "Accelerometer",
  description:
    "Halaman publik Modul 2 untuk mengirim telemetry accelerometer ke backend GAS.",
};

export default function AccelerometerPage() {
  return (
    <SiteShell>
      <AccelerometerClient />
    </SiteShell>
  );
}
