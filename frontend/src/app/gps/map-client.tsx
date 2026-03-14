"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Navigation, RefreshCw } from "lucide-react";
import { gpsService, type GpsPoint } from "@/services/gps-service";
import { hasGasBaseUrl } from "@/services/gas-client";
import { getOrCreateTelemetryDeviceId } from "@/utils/telemetry-device-id";

const CARD_CLASS =
  "overflow-hidden rounded-2xl border border-soft surface-elevated";
const LABEL_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)";
const EMPTY_GPS_ITEMS: GpsPoint[] = [];

type ReceiverBinding = {
  draftDeviceId: string;
  activeDeviceId: string;
};

function hasCoordinate(value: unknown): value is number | string {
  return value !== null && value !== undefined && value !== "";
}

function formatCoord(value: number | null | undefined) {
  if (value === null || value === undefined) return "--";
  return Number(value).toFixed(6);
}

function formatTime(value: string | null | undefined) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-soft bg-(--token-gray-50) p-4 dark:bg-(--token-white-5)">
      <p className={LABEL_CLASS}>{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

// Leaflet loaded via CDN at runtime
type LeafletLib = any;

declare global {
  interface Window {
    L: LeafletLib;
  }
}

function useLeaflet(onReady: () => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.L) {
      onReady();
      return;
    }

    const styleSelector = 'link[data-leaflet-loader="true"]';
    const scriptSelector = 'script[data-leaflet-loader="true"]';

    let styleEl = document.querySelector<HTMLLinkElement>(styleSelector);
    if (!styleEl) {
      styleEl = document.createElement("link");
      styleEl.rel = "stylesheet";
      styleEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      styleEl.dataset.leafletLoader = "true";
      document.head.appendChild(styleEl);
    }

    let scriptEl = document.querySelector<HTMLScriptElement>(scriptSelector);
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      scriptEl.dataset.leafletLoader = "true";
      document.head.appendChild(scriptEl);
    }

    const handleLoad = () => onReady();
    scriptEl.addEventListener("load", handleLoad);

    return () => {
      scriptEl?.removeEventListener("load", handleLoad);
    };
  }, [onReady]);
}

export default function GpsMapClient() {
  const [binding, setBinding] = useState<ReceiverBinding>({
    draftDeviceId: "",
    activeDeviceId: "",
  });
  const [historyLimit] = useState(200);
  const [leafletReady, setLeafletReady] = useState(false);
  const hasBackend = hasGasBaseUrl();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);

  const onLeafletReady = useCallback(() => setLeafletReady(true), []);
  useLeaflet(onLeafletReady);

  useEffect(() => {
    setBinding({
      draftDeviceId: getOrCreateTelemetryDeviceId(),
      activeDeviceId: getOrCreateTelemetryDeviceId(),
    });
  }, []);

  // Init map
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([-7.25, 112.75], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      markerRef.current = null;
      startMarkerRef.current = null;
      polylineRef.current = null;
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletReady]);

  const latestQuery = useQuery({
    queryKey: ["gps-latest", binding.activeDeviceId],
    enabled: hasBackend && !!binding.activeDeviceId,
    queryFn: async () => {
      const res = await gpsService.getLatestGps(binding.activeDeviceId);
      if (!res.ok) throw new Error(res.error ?? "latest GPS gagal");
      return res.data;
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const historyQuery = useQuery({
    queryKey: ["gps-history", binding.activeDeviceId, historyLimit],
    enabled: hasBackend && !!binding.activeDeviceId,
    queryFn: async () => {
      const now = Date.now();
      const res = await gpsService.getGpsHistory({
        deviceId: binding.activeDeviceId,
        limit: historyLimit,
        from: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        to: new Date(now).toISOString(),
      });
      if (!res.ok) throw new Error(res.error ?? "history GPS gagal");
      return res.data;
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const latest = latestQuery.data;
  const historyItems: GpsPoint[] = historyQuery.data?.items ?? EMPTY_GPS_ITEMS;

  // Update map when latest changes
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (!hasCoordinate(latest?.lat) || !hasCoordinate(latest?.lng)) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }

    const L = window.L;
    const lat = Number(latest.lat);
    const lng = Number(latest.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    if (!markerRef.current) {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;background:#ef4444;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(239,68,68,0.6)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      markerRef.current = L.marker([lat, lng], { icon })
        .bindPopup(`<b>Posisi Terkini</b><br>${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        .addTo(map);
    } else {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setPopupContent(
        `<b>Posisi Terkini</b><br>${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      );
    }

    map.setView([lat, lng], map.getZoom() < 14 ? 16 : map.getZoom());
  }, [latest, leafletReady]);

  // Update polyline when history changes
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (historyItems.length === 0) {
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      if (startMarkerRef.current) {
        map.removeLayer(startMarkerRef.current);
        startMarkerRef.current = null;
      }
      return;
    }

    const L = window.L;
    const latlngs = historyItems.map(
      (p) => [Number(p.lat), Number(p.lng)] as [number, number],
    );

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }
    polylineRef.current = L.polyline(latlngs, {
      color: "#3b82f6",
      weight: 3,
      opacity: 0.8,
    }).addTo(map);

    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
    }
    const startIcon = L.divIcon({
      className: "",
      html: `<div style="width:12px;height:12px;background:#22c55e;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(34,197,94,0.6)"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
    startMarkerRef.current = L.marker(latlngs[0], { icon: startIcon })
      .bindPopup("<b>Start</b>")
      .addTo(map);

    if (historyItems.length > 1 && polylineRef.current) {
      map.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });
    }
  }, [historyItems, leafletReady]);

  function handleApplyDeviceId() {
    setBinding((prev) => ({ ...prev, activeDeviceId: prev.draftDeviceId }));
  }

  return (
    <section className="py-10 md:py-14">
      <div className="wrapper">
        <div className="grid gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-500 dark:text-primary-400"
              >
                <ArrowLeft size={16} />
                Kembali ke Home
              </Link>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                  Modul 03 - Map
                </p>
                <h1 className="mt-2 text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white) md:text-3xl">
                  GPS Map
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Tampilkan posisi terkini sebagai marker merah dan jejak
                  perjalanan sebagai polyline biru. Data di-refresh otomatis.
                </p>
                <div className="mt-2">
                  <Link
                    href="/gps/sender"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    Kembali ke Sender
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Device ID selector */}
          <div className={`${CARD_CLASS} p-5`}>
            <p className="mb-3 text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
              Device ID
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={binding.draftDeviceId}
                onChange={(e) =>
                  setBinding((prev) => ({
                    ...prev,
                    draftDeviceId: e.target.value,
                  }))
                }
                className="flex-1 rounded-xl border border-soft bg-(--token-gray-50) px-3 py-2 font-mono text-sm text-(--token-gray-900) outline-none focus:border-primary-400 dark:bg-(--token-white-5) dark:text-(--token-white)"
                placeholder="telemetry-web-xxxx"
              />
              <button
                type="button"
                onClick={handleApplyDeviceId}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-85"
              >
                <RefreshCw size={14} />
                Apply
              </button>
            </div>
            {binding.activeDeviceId && (
              <p className="mt-2 text-xs text-(--token-gray-400)">
                Active: <span className="font-mono">{binding.activeDeviceId}</span>
              </p>
            )}
          </div>

          {/* Map */}
          <div className={`${CARD_CLASS} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-soft px-5 py-3">
              <div className="flex items-center gap-2">
                <Navigation size={16} className="text-primary-500" />
                <p className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Peta Tracking
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-(--token-gray-400)">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                  Terkini
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                  Start
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1 w-5 rounded bg-blue-500" />
                  Jalur
                </span>
              </div>
            </div>
            <div
              ref={mapRef}
              style={{ height: "400px", width: "100%" }}
              className="bg-(--token-gray-100) dark:bg-(--token-gray-800)"
            />
            {!leafletReady && (
              <div className="flex h-[400px] items-center justify-center text-sm text-(--token-gray-400)">
                Memuat peta...
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
            <div className={`${CARD_CLASS} p-6`}>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary-500" />
                <h2 className="text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Posisi Terkini
                </h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="Latitude"
                  value={formatCoord(latest?.lat)}
                  accent="text-sky-500"
                />
                <MetricCard
                  label="Longitude"
                  value={formatCoord(latest?.lng)}
                  accent="text-emerald-500"
                />
                <MetricCard
                  label="Accuracy"
                  value={
                    latest?.accuracy_m != null
                      ? `${Number(latest.accuracy_m).toFixed(1)} m`
                      : "--"
                  }
                  accent="text-amber-500"
                />
                <MetricCard
                  label="Last Update"
                  value={formatTime(latest?.ts)}
                  accent="text-violet-500"
                />
              </div>
              {(latestQuery.isError || historyQuery.isError) && (
                <p className="mt-4 text-sm text-rose-500">
                  {latestQuery.error instanceof Error
                    ? latestQuery.error.message
                    : historyQuery.error instanceof Error
                      ? historyQuery.error.message
                      : "Gagal mengambil data GPS dari backend."}
                </p>
              )}
            </div>

            <div className="grid gap-6">
              <div className={`${CARD_CLASS} p-6`}>
                <h2 className="text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Ringkasan Backend
                </h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <MetricCard
                    label="History Points"
                    value={String(historyItems.length)}
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                  <MetricCard
                    label="Window"
                    value="24 Jam"
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                  <MetricCard
                    label="Polling Latest"
                    value="5 Detik"
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                  <MetricCard
                    label="Polling History"
                    value="10 Detik"
                    accent="text-(--token-gray-900) dark:text-(--token-white)"
                  />
                </div>
              </div>

              <div className={`${CARD_CLASS} p-6`}>
                <h2 className="text-lg font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Kontrak Map
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-(--token-gray-600) dark:text-(--token-gray-300)">
                  <li>Latest: GET /telemetry/gps/latest</li>
                  <li>History: GET /telemetry/gps/history</li>
                  <li>Sender terpisah di route /gps/sender</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
