import type { AccelerometerSample } from "@/services/accelerometer-service";

export type SensorSource = "devicemotion" | "accelerometer";

export type TelemetrySessionStatus =
  | "idle"
  | "starting"
  | "live"
  | "stopping"
  | "flushing"
  | "stopped"
  | "unsupported"
  | "denied"
  | "blocked";

export type TelemetryPermissionState =
  | "unknown"
  | "granted"
  | "denied"
  | "not_required";

export type AccelerometerSupportSnapshot = {
  status:
    | "ready"
    | "permission_required"
    | "insecure_context"
    | "unsupported";
  message: string;
  browserHint: string | null;
  availableSources: SensorSource[];
  isBrave: boolean;
  isLikelyMobile: boolean;
};

export type TelemetrySessionState = {
  deviceId: string;
  status: TelemetrySessionStatus;
  permission: TelemetryPermissionState;
  source: SensorSource | null;
  liveSample: AccelerometerSample | null;
  savedSample: AccelerometerSample | null;
  queueSize: number;
  acceptedSamples: number;
  lastAcceptedCount: number;
  liveSampleCount: number;
  lastEventAt: string | null;
  lastFlushAt: string | null;
  lastStoppedAt: string | null;
  lastFlushError: string | null;
  statusMessage: string;
};

type TimeoutHandle = unknown;
type IntervalHandle = unknown;

type PermissionAwareDeviceMotion = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

type AccelerometerLike = {
  addEventListener: (
    type: "reading" | "error",
    listener: EventListenerOrEventListenerObject,
  ) => void;
  removeEventListener: (
    type: "reading" | "error",
    listener: EventListenerOrEventListenerObject,
  ) => void;
  start: () => void;
  stop?: () => void;
  x?: number | null;
  y?: number | null;
  z?: number | null;
};

type AccelerometerCtor = new (options?: {
  frequency?: number;
}) => AccelerometerLike;

type WindowLike = {
  isSecureContext?: boolean;
  navigator?: {
    userAgent?: string;
    brave?: unknown;
  };
  DeviceMotionEvent?: PermissionAwareDeviceMotion & {
    prototype?: unknown;
  };
  Accelerometer?: AccelerometerCtor;
  addEventListener?: (
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ) => void;
  removeEventListener?: (type: string, listener: EventListener) => void;
  setTimeout?: (handler: () => void, timeout?: number) => TimeoutHandle;
  clearTimeout?: (handle: any) => void;
  setInterval?: (handler: () => void, timeout?: number) => IntervalHandle;
  clearInterval?: (handle: any) => void;
  console?: Pick<Console, "info" | "warn">;
};

type SensorRuntime = {
  source: SensorSource;
  stop: () => void | Promise<void>;
};

type FlushResult = {
  accepted: number;
};

type ControllerOptions = {
  deviceId: string;
  flushSamples: (payload: {
    deviceId: string;
    samples: AccelerometerSample[];
    sessionStartedAt: string;
    source: SensorSource;
  }) => Promise<FlushResult>;
  onStateChange?: (state: TelemetrySessionState) => void;
  onFlushSuccess?: () => void;
  createRuntime?: (
    targetWindow: WindowLike,
    onSample: (sample: AccelerometerSample) => void,
  ) => Promise<SensorRuntime>;
  now?: () => number;
  flushSize?: number;
  flushIntervalMs?: number;
  blockedTimeoutMs?: number;
};

function defaultNow() {
  return Date.now();
}

export function createInitialTelemetrySessionState(
  deviceId: string,
): TelemetrySessionState {
  return {
    deviceId,
    status: "idle",
    permission: "unknown",
    source: null,
    liveSample: null,
    savedSample: null,
    queueSize: 0,
    acceptedSamples: 0,
    lastAcceptedCount: 0,
    liveSampleCount: 0,
    lastEventAt: null,
    lastFlushAt: null,
    lastStoppedAt: null,
    lastFlushError: null,
    statusMessage: "Siap memulai sesi telemetry realtime.",
  };
}

function normalizeFiniteNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return Number(value.toFixed(4));
}

function buildSampleFromValues(
  x: unknown,
  y: unknown,
  z: unknown,
  now: () => number,
): AccelerometerSample | null {
  const nextX = normalizeFiniteNumber(x);
  const nextY = normalizeFiniteNumber(y);
  const nextZ = normalizeFiniteNumber(z);

  if (nextX === null && nextY === null && nextZ === null) {
    return null;
  }

  return {
    t: new Date(now()).toISOString(),
    x: nextX ?? 0,
    y: nextY ?? 0,
    z: nextZ ?? 0,
  };
}

function readBraveFlag(targetWindow: WindowLike) {
  if (targetWindow.navigator?.brave) {
    return true;
  }

  const userAgent = targetWindow.navigator?.userAgent ?? "";
  return /brave/i.test(userAgent);
}

function readMobileFlag(targetWindow: WindowLike) {
  const userAgent = targetWindow.navigator?.userAgent ?? "";
  return /android|iphone|ipad|ipod|mobile/i.test(userAgent);
}

export function detectAccelerometerSupport(
  targetWindow: WindowLike,
): AccelerometerSupportSnapshot {
  const availableSources: SensorSource[] = [];
  const isBrave = readBraveFlag(targetWindow);
  const isLikelyMobile = readMobileFlag(targetWindow);

  if (!targetWindow.isSecureContext) {
    return {
      status: "insecure_context",
      message: "Sensor gerak hanya tersedia di secure context HTTPS.",
      browserHint: "Buka aplikasi lewat HTTPS agar browser mengizinkan akses sensor.",
      availableSources,
      isBrave,
      isLikelyMobile,
    };
  }

  if (typeof targetWindow.DeviceMotionEvent !== "undefined") {
    availableSources.push("devicemotion");
  }
  if (typeof targetWindow.Accelerometer === "function") {
    availableSources.push("accelerometer");
  }

  if (availableSources.length === 0) {
    return {
      status: "unsupported",
      message: isLikelyMobile
        ? "Browser ini tidak mengekspos API sensor accelerometer."
        : "Perangkat desktop atau laptop ini kemungkinan tidak menyediakan sensor accelerometer yang dapat diakses browser.",
      browserHint: isBrave
        ? "Brave dapat memblokir sensor gerak. Cek izin site settings atau gunakan Chrome mobile."
        : isLikelyMobile
          ? "Gunakan browser mobile yang mendukung Device Motion API."
          : "Untuk uji accelerometer, gunakan HP atau tablet. Sebagian laptop 2-in-1 bisa punya sensor, tetapi banyak desktop tidak mengeksposnya ke web.",
      availableSources,
      isBrave,
      isLikelyMobile,
    };
  }

  if (typeof targetWindow.DeviceMotionEvent?.requestPermission === "function") {
    return {
      status: "permission_required",
      message: "Browser akan meminta izin sensor saat sesi dimulai.",
      browserHint: null,
      availableSources,
      isBrave,
      isLikelyMobile,
    };
  }

  return {
    status: "ready",
    message: isLikelyMobile
      ? "Browser siap mencoba membaca sensor accelerometer."
      : "Browser dapat mencoba Device Motion API, tetapi pada desktop event sensor sering memang tidak tersedia.",
    browserHint: isBrave
      ? "Jika Brave tidak mengirim event sensor, cek permission site atau coba Chrome mobile."
      : isLikelyMobile
        ? null
        : "Jika desktop tidak mengirim event, itu biasanya berarti perangkat tidak punya sensor gerak yang diekspos ke browser.",
    availableSources,
    isBrave,
    isLikelyMobile,
  };
}

export async function requestMotionPermissionIfNeeded(
  targetWindow: WindowLike,
): Promise<TelemetryPermissionState> {
  if (typeof targetWindow.DeviceMotionEvent?.requestPermission !== "function") {
    return "not_required";
  }

  const result = await targetWindow.DeviceMotionEvent.requestPermission();
  return result === "granted" ? "granted" : "denied";
}

async function startDeviceMotionRuntime(
  targetWindow: WindowLike,
  onSample: (sample: AccelerometerSample) => void,
  now: () => number,
): Promise<SensorRuntime> {
  if (
    typeof targetWindow.addEventListener !== "function" ||
    typeof targetWindow.removeEventListener !== "function"
  ) {
    throw new Error("device_motion_listener_unavailable");
  }

  const listener = (event: Event) => {
    const motionEvent = event as DeviceMotionEvent;
    const accel =
      motionEvent.acceleration ?? motionEvent.accelerationIncludingGravity;
    const sample = buildSampleFromValues(accel?.x, accel?.y, accel?.z, now);
    if (!sample) {
      return;
    }
    onSample(sample);
  };

  targetWindow.addEventListener("devicemotion", listener as EventListener, {
    passive: true,
  });

  return {
    source: "devicemotion",
    stop() {
      targetWindow.removeEventListener?.(
        "devicemotion",
        listener as EventListener,
      );
    },
  };
}

async function startGenericAccelerometerRuntime(
  targetWindow: WindowLike,
  onSample: (sample: AccelerometerSample) => void,
  now: () => number,
): Promise<SensorRuntime> {
  const AccelerometerCtor = targetWindow.Accelerometer;
  if (typeof AccelerometerCtor !== "function") {
    throw new Error("accelerometer_api_unavailable");
  }

  const sensor = new AccelerometerCtor({ frequency: 30 });
  const readingListener = () => {
    const sample = buildSampleFromValues(sensor.x, sensor.y, sensor.z, now);
    if (!sample) {
      return;
    }
    onSample(sample);
  };

  const errorListener = () => {
    targetWindow.console?.warn?.(
      "[accelerometer] generic sensor API emitted an error event.",
    );
  };

  sensor.addEventListener("reading", readingListener);
  sensor.addEventListener("error", errorListener);
  sensor.start();

  return {
    source: "accelerometer",
    stop() {
      sensor.removeEventListener("reading", readingListener);
      sensor.removeEventListener("error", errorListener);
      sensor.stop?.();
    },
  };
}

export async function startBestEffortSensorRuntime(
  targetWindow: WindowLike,
  onSample: (sample: AccelerometerSample) => void,
  now: () => number = defaultNow,
): Promise<SensorRuntime> {
  const support = detectAccelerometerSupport(targetWindow);

  if (support.availableSources.includes("devicemotion")) {
    return startDeviceMotionRuntime(targetWindow, onSample, now);
  }

  if (support.availableSources.includes("accelerometer")) {
    return startGenericAccelerometerRuntime(targetWindow, onSample, now);
  }

  throw new Error("accelerometer_unsupported");
}

function buildBlockedMessage(targetWindow: WindowLike, source: SensorSource | null) {
  const isBrave = readBraveFlag(targetWindow);
  const isLikelyMobile = readMobileFlag(targetWindow);
  if (isBrave) {
    return `Browser Brave belum mengirim event ${
      source ?? "sensor"
    }. Cek izin sensor gerak pada site settings, matikan blokir sensor jika ada, atau coba Chrome mobile.`;
  }

  if (!isLikelyMobile) {
    return `Perangkat desktop atau laptop ini belum mengirim event ${
      source ?? "sensor"
    }. Pada desktop, ini biasanya berarti tidak ada accelerometer yang diekspos ke browser, jadi kondisi ini normal kecuali perangkat memang punya sensor gerak.`;
  }

  return `Browser belum mengirim event ${
    source ?? "sensor"
  }. Pastikan perangkat memiliki sensor gerak dan izin browser tidak diblokir.`;
}

export function createAccelerometerSessionController(options: ControllerOptions) {
  const now = options.now ?? defaultNow;
  const flushSize = options.flushSize ?? 12;
  const flushIntervalMs = options.flushIntervalMs ?? 1200;
  const blockedTimeoutMs = options.blockedTimeoutMs ?? 2200;
  const createRuntime = options.createRuntime ?? startBestEffortSensorRuntime;

  let state = createInitialTelemetrySessionState(options.deviceId);
  let runtime: SensorRuntime | null = null;
  let flushIntervalHandle: IntervalHandle | null = null;
  let blockedTimeoutHandle: TimeoutHandle | null = null;
  let queue: AccelerometerSample[] = [];
  let sessionStartedAt: string | null = null;
  let flushPromise: Promise<void> | null = null;

  function emit() {
    options.onStateChange?.({ ...state });
  }

  function setState(partial: Partial<TelemetrySessionState>) {
    state = {
      ...state,
      ...partial,
      queueSize: queue.length,
    };
    emit();
  }

  function clearTimers(targetWindow: WindowLike) {
    if (flushIntervalHandle !== null) {
      targetWindow.clearInterval?.(flushIntervalHandle);
      flushIntervalHandle = null;
    }
    if (blockedTimeoutHandle !== null) {
      targetWindow.clearTimeout?.(blockedTimeoutHandle);
      blockedTimeoutHandle = null;
    }
  }

  function handleSample(sample: AccelerometerSample) {
    queue.push(sample);

    setState({
      status: "live",
      liveSample: sample,
      lastEventAt: sample.t,
      liveSampleCount: state.liveSampleCount + 1,
      lastFlushError: null,
      statusMessage: "Sensor aktif dan mengirim pembacaan realtime.",
    });

    if (queue.length >= flushSize) {
      void flush("threshold");
    }
  }

  async function flush(reason: "threshold" | "interval" | "stop") {
    if (queue.length === 0 || !sessionStartedAt || !state.source) {
      return;
    }

    if (flushPromise) {
      return flushPromise;
    }

    const batch = queue.splice(0, queue.length);
    const previousStatus = state.status;

    setState({
      status:
        previousStatus === "stopping"
          ? "stopping"
          : previousStatus === "stopped"
            ? "stopped"
            : "flushing",
      statusMessage:
        reason === "stop"
          ? "Menghentikan telemetry dan menyimpan sisa sample terakhir."
          : "Mengirim sample buffered ke backend.",
    });

    flushPromise = (async () => {
      try {
        const result = await options.flushSamples({
          deviceId: state.deviceId,
          samples: batch,
          sessionStartedAt,
          source: state.source!,
        });

        setState({
          status: runtime ? "live" : previousStatus === "stopping" ? "stopping" : "stopped",
          acceptedSamples: state.acceptedSamples + result.accepted,
          lastFlushAt: new Date(now()).toISOString(),
          savedSample: batch[batch.length - 1] ?? state.savedSample,
          lastFlushError: null,
          statusMessage: runtime
            ? "Sesi live aktif. Sample terbaru berhasil disimpan."
            : "Sesi dihentikan dan sample terakhir berhasil disimpan.",
        });

        options.onFlushSuccess?.();
      } catch (error) {
        queue = batch.concat(queue);
        const message =
          error instanceof Error ? error.message : "flush telemetry gagal";
        setState({
          status: runtime ? "live" : "stopped",
          lastFlushError: message,
          statusMessage: "Sample live tetap berjalan, tetapi flush backend gagal.",
        });
      } finally {
        flushPromise = null;
      }
    })();

    return flushPromise;
  }

  async function start(targetWindow: WindowLike) {
    if (
      state.status === "starting" ||
      state.status === "live" ||
      state.status === "flushing" ||
      state.status === "stopping"
    ) {
      return state;
    }

    const support = detectAccelerometerSupport(targetWindow);
    if (support.status === "insecure_context" || support.status === "unsupported") {
      setState({
        status: "unsupported",
        statusMessage: support.message,
      });
      return state;
    }

    setState({
      status: "starting",
      lastAcceptedCount: 0,
      lastStoppedAt: null,
      lastFlushError: null,
      statusMessage: "Memulai sesi telemetry dan menunggu event sensor pertama.",
    });

    const permission = await requestMotionPermissionIfNeeded(targetWindow);
    if (permission === "denied") {
      setState({
        status: "denied",
        permission,
        statusMessage:
          "Izin sensor ditolak. Izinkan motion sensor di browser lalu coba lagi.",
      });
      return state;
    }

    setState({
      permission,
      statusMessage:
        permission === "granted"
          ? "Izin sensor diberikan. Mengaktifkan stream accelerometer."
          : "Mengaktifkan stream accelerometer.",
    });

    runtime = await createRuntime(targetWindow, handleSample);
    sessionStartedAt = new Date(now()).toISOString();

    targetWindow.console?.info?.(
      `[accelerometer] session started via ${runtime.source}`,
    );

    setState({
      status: "live",
      source: runtime.source,
      statusMessage: `Stream ${
        runtime.source
      } aktif. Gerakkan perangkat untuk melihat pembacaan realtime.`,
    });

    blockedTimeoutHandle =
      targetWindow.setTimeout?.(() => {
        if (state.liveSampleCount > 0) {
          return;
        }

        setState({
          status: "blocked",
          statusMessage: buildBlockedMessage(targetWindow, runtime?.source ?? null),
        });
      }, blockedTimeoutMs) ?? null;

    flushIntervalHandle =
      targetWindow.setInterval?.(() => {
        void flush("interval");
      }, flushIntervalMs) ?? null;

    return state;
  }

  async function stop(targetWindow: WindowLike) {
    if (
      state.status === "idle" ||
      state.status === "stopped" ||
      state.status === "unsupported" ||
      state.status === "denied"
    ) {
      return state;
    }

    const acceptedBeforeStop = state.acceptedSamples;

    setState({
      status: "stopping",
      statusMessage: "Stopping telemetry... menyimpan sisa sample terakhir.",
      lastFlushError: null,
    });

    if (runtime) {
      await runtime.stop();
      runtime = null;
    }

    clearTimers(targetWindow);
    await flush("stop");

    setState({
      status: "stopped",
      lastAcceptedCount: Math.max(0, state.acceptedSamples - acceptedBeforeStop),
      lastStoppedAt: new Date(now()).toISOString(),
      statusMessage:
        state.acceptedSamples > 0
          ? "Sesi realtime berhenti. Sample terakhir sudah dibekukan dan tersimpan."
          : "Sesi realtime dihentikan.",
    });

    return state;
  }

  async function dispose(targetWindow: WindowLike) {
    await stop(targetWindow);
  }

  return {
    getState() {
      return { ...state };
    },
    start,
    stop,
    flush,
    dispose,
  };
}
