import type { Metadata } from "next";
import SiteShell from "@/components/layout/site-shell";
import AccelerometerSenderClient from "../sender-client";

export const metadata: Metadata = {
  title: "Accelerometer Sender",
  description:
    "Modul 2 sender: baca sensor accelerometer lokal dan kirim batch ke backend GAS.",
};

export default function AccelerometerSenderPage() {
  return (
    <SiteShell>
      <AccelerometerSenderClient />
    </SiteShell>
  );
}
