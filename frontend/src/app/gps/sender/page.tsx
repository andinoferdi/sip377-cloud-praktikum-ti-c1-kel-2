import type { Metadata } from "next";
import SiteShell from "@/components/layout/site-shell";
import GpsSenderClient from "../sender-client";

export const metadata: Metadata = {
  title: "GPS Sender",
  description:
    "Modul 3 sender: baca GPS perangkat dan kirim titik lokasi ke backend GAS.",
};

export default function GpsSenderPage() {
  return (
    <SiteShell>
      <GpsSenderClient />
    </SiteShell>
  );
}