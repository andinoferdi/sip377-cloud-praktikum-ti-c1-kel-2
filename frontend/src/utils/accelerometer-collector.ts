import { sendAccelBatch, AccelBatchPayload, AccelSample } from '@/services/accelerometer-service';

/**
 * Mengumpulkan data accelerometer dari device sensor
 * @param onSampleCollected - callback ketika data terkumpul
 * @param intervalMs - interval sampling dalam milliseconds
 * @returns function untuk stop collecting
 */
export async function startAccelCollector(
  messageCallback?: (msg: string) => void,
): Promise<() => void> {
  const samples: AccelSample[] = [];
  let isCollecting = true;

  // Check if device supports accelerometer
  if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
    messageCallback?.('Device tidak mendukung accelerometer');
    return () => {
      isCollecting = false;
    };
  }

  const handler = (event: DeviceMotionEvent) => {
    if (!isCollecting || !event.acceleration) return;

    const timestamp = new Date().toISOString();
    samples.push({
      t: timestamp,
      x: event.acceleration.x ?? 0,
      y: event.acceleration.y ?? 0,
      z: event.acceleration.z ?? 0,
    });
  };

  // Request permission untuk iOS 13+
  if (typeof window !== 'undefined' && typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
    try {
      const result = await (DeviceMotionEvent as any).requestPermission();
      if (result !== 'granted') {
        messageCallback?.('Izin accelerometer ditolak');
        return () => {
          isCollecting = false;
        };
      }
      messageCallback?.('Izin accelerometer diberikan');
    } catch (error) {
      messageCallback?.(`Error requesting permission: ${error}`);
    }
  }

  // Add listener
  window.addEventListener('devicemotion', handler);

  messageCallback?.('Mulai mengumpulkan data accelerometer...');

  // Return stop function
  return () => {
    isCollecting = false;
    window.removeEventListener('devicemotion', handler);
    messageCallback?.(`Berhenti. Total sampel terkumpul: ${samples.length}`);
  };
}

/**
 * Mengirim batch data accelerometer yang sudah dikumpulkan
 */
export async function sendCollectedAccelBatch(
  deviceId: string,
  samples: AccelSample[],
  signal?: AbortSignal,
) {
  if (!deviceId || samples.length === 0) {
    throw new Error('Device ID dan samples harus tidak kosong');
  }

  const payload: AccelBatchPayload = {
    device_id: deviceId,
    ts: new Date().toISOString(),
    samples,
  };

  return sendAccelBatch(payload, signal);
}

/**
 * Contoh: Collect for N seconds then send
 */
export async function collectAndSendAccelFor(
  deviceId: string,
  durationMs: number = 5000,
  messageCallback?: (msg: string) => void,
) {
  messageCallback?.('Memulai pengumpulan data selama ' + durationMs + 'ms...');

  const stopCollector = await startAccelCollector(messageCallback);
  
  // We need to store samples internally, so let's use a different approach
  const samples: AccelSample[] = [];
  let isCollecting = true;

  if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
    messageCallback?.('Device tidak mendukung accelerometer');
    return { ok: false, error: 'Device tidak mendukung accelerometer' };
  }

  const handler = (event: DeviceMotionEvent) => {
    if (!isCollecting || !event.acceleration) return;

    const timestamp = new Date().toISOString();
    samples.push({
      t: timestamp,
      x: event.acceleration.x ?? 0,
      y: event.acceleration.y ?? 0,
      z: event.acceleration.z ?? 0,
    });
  };

  // Request permission untuk iOS 13+
  if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
    try {
      const result = await (DeviceMotionEvent as any).requestPermission();
      if (result !== 'granted') {
        messageCallback?.('Izin accelerometer ditolak');
        return { ok: false, error: 'Permission denied' };
      }
    } catch (error) {
      messageCallback?.(`Error requesting permission: ${error}`);
      return { ok: false, error: String(error) };
    }
  }

  window.addEventListener('devicemotion', handler);

  // Wait for duration
  await new Promise(resolve => setTimeout(resolve, durationMs));

  isCollecting = false;
  window.removeEventListener('devicemotion', handler);

  messageCallback?.(`Pengumpulan selesai. Total: ${samples.length} sampel`);

  // Send to server
  if (samples.length === 0) {
    messageCallback?.('Tidak ada data accelerometer yang dikumpulkan');
    return { ok: false, error: 'No samples collected' };
  }

  try {
    messageCallback?.('Mengirim data ke server...');
    const response = await sendCollectedAccelBatch(deviceId, samples);
    
    if (response.ok) {
      messageCallback?.(`✓ Berhasil mengirim ${response.data?.accepted || 0} sampel`);
    } else {
      messageCallback?.(`✗ Error: ${response.error}`);
    }

    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    messageCallback?.(`✗ Error mengirim: ${errorMsg}`);
    return { ok: false, error: errorMsg };
  }
}
