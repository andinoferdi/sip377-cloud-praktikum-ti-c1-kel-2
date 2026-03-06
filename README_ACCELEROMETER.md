# 📊 Modul 2: Accelerometer - Implementasi Lengkap

Dokumentasi lengkap untuk modul Accelerometer yang mengirim data sensor accelerometer dari smartphone ke cloud backend dan menampilkan data secara real-time di dashboard.

## 📁 File & Struktur yang Dibuat

### Backend (Google Apps Script - Already Implemented)
```
backend-gas/
└── Code.gs
    ├── batchAccel(body)         - POST handler untuk menerima batch data
    ├── getAccelLatest(deviceId) - GET handler untuk ambil data terbaru
    └── Sheet: 'accel' dengan columns: device_id, x, y, z, sample_ts, batch_ts, recorded_at
```

### Frontend - Services Layer
```
frontend/src/services/
└── accelerometer-service.ts
    ├── Types:
    │   ├── AccelSample
    │   ├── AccelBatchPayload
    │   ├── AccelLatestResponse
    │   └── ApiResponse<T>
    ├── sendAccelBatch()  - POST /telemetry/accel
    └── getAccelLatest()  - GET /telemetry/accel/latest
```

### Frontend - Custom Hooks
```
frontend/src/hooks/
└── use-accel-latest.ts
    └── useAccelLatest()
        - Auto polling dengan interval
        - Handles loading, error, data states
        - Cleanup on unmount
```

### Frontend - UI Components
```
frontend/src/app/dashboard/components/
├── accel-sidebar.tsx
│   └── AccelSidebar component
│       - Display real-time x, y, z values
│       - Show timestamp
│       - Device ID info
│       - Status indicators
│
└── accel-test-comp.tsx
    └── AccelTestComp component
        - Button to trigger data collection
        - Collect 5 seconds of sensor data
        - Display messages & status
        - Integration with accelerometer-collector
```

### Frontend - Utilities
```
frontend/src/utils/
└── accelerometer-collector.ts
    ├── startAccelCollector()        - Start collecting device motion data
    ├── sendCollectedAccelBatch()    - Send batch to backend
    └── collectAndSendAccelFor()     - Combine: collect N seconds then send
        - Uses DeviceMotionEvent API
        - Handles iOS 13+ permission
        - Message callbacks for UI feedback
```

### Frontend - Page Integration
```
frontend/src/app/dashboard/mahasiswa/scan/
└── page.tsx (UPDATED)
    └── Added imports:
        - AccelSidebar
        - AccelTestComp
    └── Added to UI:
        - Right sidebar column with Accelerometer components
        - Polling every 2 seconds for latest data
```

### Documentation
```
project-root/
├── MODUL_2_ACCELEROMETER.md  - Lengkap technical documentation
└── postman/
    └── accelerometer-api.json - Postman collection untuk testing API
```

---

## 🚀 Quick Start

### 1. Deploy & Test dari Browser
```bash
1. Navigate to: /dashboard/mahasiswa/scan
2. Di sidebar kanan, klik tombol "Kirim Data Accel"
3. Sistem akan:
   - Collect accelerometer data selama 5 detik
   - Kirim ke backend
   - Display latest data di sidebar
```

### 2. Gunakan Hook di Component
```tsx
import { useAccelLatest } from "@/hooks/use-accel-latest";

export function MyComponent() {
  const { data, loading, error } = useAccelLatest({
    deviceId: "dev-001",
    enabled: true,
    pollingIntervalMs: 2000,
  });

  return (
    <div>
      {data && <p>X: {data.x}, Y: {data.y}, Z: {data.z}</p>}
    </div>
  );
}
```

### 3. Collect & Send Manual
```tsx
import { collectAndSendAccelFor } from "@/utils/accelerometer-collector";

const response = await collectAndSendAccelFor(
  "dev-001",    // device_id
  5000,         // 5 seconds
  (msg) => console.log(msg)
);
// response: { ok: true, data: { accepted: N } }
```

---

## 📋 API Specification

### POST /telemetry/accel
Kirim batch accelerometer data

**Request:**
```json
{
  "device_id": "dev-001",
  "ts": "2026-02-18T10:15:30Z",
  "samples": [
    {"t": "2026-02-18T10:15:29.100Z", "x": 0.12, "y": 0.01, "z": 9.70},
    {"t": "2026-02-18T10:15:29.300Z", "x": 0.15, "y": 0.02, "z": 9.68}
  ]
}
```

**Response:**
```json
{"ok": true, "data": {"accepted": 2}}
```

### GET /telemetry/accel/latest?device_id=dev-001
Ambil data accelerometer terbaru

**Response:**
```json
{
  "ok": true,
  "data": {
    "t": "2026-02-18T10:15:29.300Z",
    "x": 0.15,
    "y": 0.02,
    "z": 9.68
  }
}
```

---

## 🧪 Testing

### Menggunakan Test Component
Navigasi ke `/dashboard/mahasiswa/scan` → Klik "Kirim Data Accel"

### Menggunakan cURL
```bash
# Send batch
curl -X POST 'https://script.google.com/.../usercallback?path=telemetry/accel' \
  -H 'Content-Type: text/plain;charset=UTF-8' \
  -d '{...}'

# Get latest
curl -X GET 'https://script.google.com/.../usercallback?path=telemetry/accel/latest&device_id=dev-001'
```

### Menggunakan Postman
Import file: `postman/accelerometer-api.json`

---

## 📊 Data Storage (Google Sheets)

Sheet: `accel`

| Column | Name | Type | Example |
|--------|------|------|---------|
| A | device_id | String | dev-001 |
| B | x | Number | 0.15 |
| C | y | Number | 0.02 |
| D | z | Number | 9.68 |
| E | sample_ts | DateTime | 2026-02-18T10:15:29.300Z |
| F | batch_ts | DateTime | 2026-02-18T10:15:30Z |
| G | recorded_at | DateTime | 2026-02-18T10:15:30.500Z |

---

## 🔧 Development Notes

### Browser Requirements
- ✅ HTTPS atau localhost (security context)
- ✅ Device Motion API support (Chrome, Firefox, Safari mobile)
- ✅ Permission dialog (iOS 13+)

### Key Implementation Details
1. **DeviceMotionEvent API**: Read accelerometer values di real-time
2. **Polling Hook**: Auto-refresh latest data dengan configurable interval
3. **Batch Collection**: Group multiple samples sebelum POST
4. **Error Handling**: Graceful fallbacks jika sensor tidak tersedia

### Environment Variables
Pastikan `.env.local` atau `.env` memiliki:
```
NEXT_PUBLIC_GAS_BASE_URL=https://script.google.com
```

---

## 📝 Checklist Implementation

- ✅ Backend API endpoints (batchAccel, getAccelLatest)
- ✅ Service layer (accelerometer-service.ts)
- ✅ Custom hook (use-accel-latest.ts)
- ✅ UI Components (accel-sidebar, accel-test-comp)
- ✅ Sensor collector (accelerometer-collector.ts)
- ✅ Page integration (mahasiswa/scan page)
- ✅ Documentation (MODUL_2_ACCELEROMETER.md)
- ✅ Postman collection (accelerometer-api.json)
- ⏳ Real-time chart visualization (optional)
- ⏳ Historical data endpoint (optional)

---

## 🔗 Related Files

- Backend: `backend-gas/Code.gs` (lines ~1166-1210)
- Documentation: `MODUL_2_ACCELEROMETER.md`
- Test Examples: `postman/accelerometer-api.json`

---

## 💡 Tips

1. **Device ID**: Generated once per browser dan stored di localStorage (via `getOrCreateAttendanceDeviceId`)
2. **Batching**: Setiap POST dapat berisi multiple samples (2-100+)
3. **Polling**: Hook akan stop pada unmount automatik (cleanup)
4. **Errors**: Check console logs untuk detail error message

---

## 📞 Support

Untuk pertanyaan atau issues:
1. Baca dokumentasi lengkap di `MODUL_2_ACCELEROMETER.md`
2. Check backend implementation di `backend-gas/Code.gs`
3. Debug di browser DevTools Console
4. Test API menggunakan Postman collection
