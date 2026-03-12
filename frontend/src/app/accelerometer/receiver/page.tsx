import type { Metadata } from "next";
import SiteShell from "@/components/layout/site-shell";
import AccelerometerReceiverClient from "../receiver-client";

export const metadata: Metadata = {
  title: "Accelerometer Receiver",
  description:
    "Modul 2 receiver: ambil telemetry accelerometer dari backend GAS dan tampilkan chart.",
};

export default function AccelerometerReceiverPage() {
  return (
    <SiteShell>
      <AccelerometerReceiverClient />
    </SiteShell>
  );
}
