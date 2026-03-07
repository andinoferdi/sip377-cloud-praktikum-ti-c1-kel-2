import type { AccelSample } from "@/services/accelerometer-service";

type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export type AccelerometerSupport = {
  supported: boolean;
  reason: string | null;
  requiresPermission: boolean;
};

type WindowLike = {
  isSecureContext?: boolean;
  DeviceMotionEvent?: DeviceMotionEventWithPermission;
};

type CollectAccelerometerSamplesOptions = {
  durationMs?: number;
  onMessage?: (message: string) => void;
};

function getWindowLike() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window as WindowLike;
}

export function getAccelerometerSupport(targetWindow = getWindowLike()): AccelerometerSupport {
  if (!targetWindow) {
    return {
      supported: false,
      reason: "Sensor hanya bisa diakses dari browser.",
      requiresPermission: false,
    };
  }

  if (!targetWindow.isSecureContext) {
    return {
      supported: false,
      reason: "Sensor memerlukan secure context seperti HTTPS atau localhost.",
      requiresPermission: false,
    };
  }

  if (typeof targetWindow.DeviceMotionEvent === "undefined") {
    return {
      supported: false,
      reason: "Browser atau perangkat ini tidak mengekspos Device Motion API.",
      requiresPermission: false,
    };
  }

  return {
    supported: true,
    reason: null,
    requiresPermission:
      typeof targetWindow.DeviceMotionEvent.requestPermission === "function",
  };
}

async function ensureMotionPermission(
  targetWindow: WindowLike,
  onMessage?: (message: string) => void,
) {
  const support = getAccelerometerSupport(targetWindow);
  if (!support.supported) {
    throw new Error(support.reason ?? "Sensor accelerometer tidak tersedia.");
  }

  const deviceMotion = targetWindow.DeviceMotionEvent;
  if (!deviceMotion || typeof deviceMotion.requestPermission !== "function") {
    return;
  }

  onMessage?.("Meminta izin akses sensor gerak...");
  const permission = await deviceMotion.requestPermission();
  if (permission !== "granted") {
    throw new Error("Izin sensor ditolak.");
  }
}

export async function collectAccelerometerSamples(
  options: CollectAccelerometerSamplesOptions = {},
) {
  const targetWindow = getWindowLike();
  const support = getAccelerometerSupport(targetWindow);
  if (!support.supported || !targetWindow) {
    throw new Error(support.reason ?? "Sensor accelerometer tidak tersedia.");
  }

  const durationMs = Math.max(1000, options.durationMs ?? 5000);
  await ensureMotionPermission(targetWindow, options.onMessage);

  const samples: AccelSample[] = [];
  const onMessage = options.onMessage;

  onMessage?.("Mulai mengumpulkan data accelerometer...");

  return new Promise<AccelSample[]>((resolve, reject) => {
    const handler = (event: DeviceMotionEvent) => {
      const reading = event.acceleration ?? event.accelerationIncludingGravity;
      if (!reading) {
        return;
      }

      const x = reading.x;
      const y = reading.y;
      const z = reading.z;
      if (x === null || y === null || z === null) {
        return;
      }

      samples.push({
        t: new Date().toISOString(),
        x,
        y,
        z,
      });
    };

    const cleanup = () => {
      window.removeEventListener("devicemotion", handler);
      window.clearTimeout(timeoutId);
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();

      if (samples.length === 0) {
        reject(
          new Error(
            "Tidak ada data gerak yang terbaca. Coba gerakkan perangkat lalu ulangi.",
          ),
        );
        return;
      }

      onMessage?.(`Pengumpulan selesai. Total ${samples.length} sampel.`);
      resolve(samples);
    }, durationMs);

    window.addEventListener("devicemotion", handler);
  });
}
