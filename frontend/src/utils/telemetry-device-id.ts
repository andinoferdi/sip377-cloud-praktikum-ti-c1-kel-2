const DEVICE_ID_KEY = "ctc_telemetry_device_id";

function generateDeviceId() {
  return `telemetry-web-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateTelemetryDeviceId() {
  if (typeof window === "undefined") {
    return "telemetry-server";
  }

  const existingValue = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existingValue) {
    return existingValue;
  }

  const generatedValue = generateDeviceId();
  window.localStorage.setItem(DEVICE_ID_KEY, generatedValue);
  return generatedValue;
}
