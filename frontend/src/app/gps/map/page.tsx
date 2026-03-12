import type { Metadata } from "next";
import SiteShell from "@/components/layout/site-shell";
import GpsMapClient from "../map-client";

export const metadata: Metadata = {
  title: "GPS Map",
  description:
    "Modul 3 map: tampilkan posisi terkini dan jejak perjalanan dari backend GAS.",
};

export default function GpsMapPage() {
  return (
    <SiteShell>
      <GpsMapClient />
    </SiteShell>
  );
}