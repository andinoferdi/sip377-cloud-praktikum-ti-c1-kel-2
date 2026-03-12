import type { AccelerometerSample } from "@/services/accelerometer-service";

export type ReceiverBindingState = {
  draftDeviceId: string;
  activeDeviceId: string;
};

export const RECEIVER_REFETCH_INTERVAL_MIN_MS = 2000;
export const RECEIVER_REFETCH_INTERVAL_MAX_MS = 5000;
export const RECEIVER_REFETCH_INTERVAL_DEFAULT_MS = 3000;
export const RECEIVER_Z_DEADZONE = 0.02;
export const RECEIVER_Z_SMOOTHING_ALPHA = 0.18;

export function createInitialReceiverBindingState(): ReceiverBindingState {
  return {
    draftDeviceId: "",
    activeDeviceId: "",
  };
}

export function applyReceiverDeviceSelection(draftDeviceId: string) {
  return draftDeviceId.trim();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function computeReceiverRefetchIntervalMs(queryMs?: number) {
  if (!Number.isFinite(queryMs) || typeof queryMs !== "number" || queryMs <= 0) {
    return RECEIVER_REFETCH_INTERVAL_DEFAULT_MS;
  }

  const scaled = Math.round(queryMs * 0.8);
  return clamp(
    scaled,
    RECEIVER_REFETCH_INTERVAL_MIN_MS,
    RECEIVER_REFETCH_INTERVAL_MAX_MS,
  );
}

export function buildReceiverFilteredSample(
  history: AccelerometerSample[],
): AccelerometerSample | null {
  if (history.length === 0) {
    return null;
  }

  const latest = history[history.length - 1];
  if (!latest) {
    return null;
  }

  let filteredZ: number | null = null;

  for (let index = 0; index < history.length; index += 1) {
    const sample = history[index];
    if (!sample) {
      continue;
    }
    if (!Number.isFinite(sample.z)) {
      continue;
    }

    if (filteredZ === null) {
      filteredZ = sample.z;
      continue;
    }

    const delta = Math.abs(sample.z - filteredZ);
    if (delta < RECEIVER_Z_DEADZONE) {
      continue;
    }

    filteredZ += (sample.z - filteredZ) * RECEIVER_Z_SMOOTHING_ALPHA;
  }

  return {
    ...latest,
    z: filteredZ ?? latest.z,
  };
}
