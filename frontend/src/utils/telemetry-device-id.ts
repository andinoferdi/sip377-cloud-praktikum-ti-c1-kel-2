const TELEMETRY_DEVICE_ID_KEY = "ctc_telemetry_device_id";

function generateDeviceId() {
  return `dev-web-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateTelemetryDeviceId() {
  if (typeof window === "undefined") {
    return "dev-web-server";
  }

  const existingValue = window.localStorage.getItem(TELEMETRY_DEVICE_ID_KEY);
  if (existingValue) {
    return existingValue;
  }

  const generatedValue = generateDeviceId();
  window.localStorage.setItem(TELEMETRY_DEVICE_ID_KEY, generatedValue);
  return generatedValue;
}
