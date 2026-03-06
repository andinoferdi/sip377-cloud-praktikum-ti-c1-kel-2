# Modul 2: Accelerometer

## Tujuan Modul
- Mengirim data sensor accelerometer dari smartphone secara periodik ke cloud backend
- Menampilkan data terbaru accelerometer di dashboard
- Selektif: menampilkan data dalam grafik real-time

## Alur Sistem (End-to-End)

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT (Frontend/Smartphone)                               │
│  - Baca accelerometer (x, y, z) dari sensor                │
│  - Kumpulkan data dalam batch (2–5 detik)                 │
│  - Kirim batch ke server: POST /telemetry/accel           │
│  - Dashboard polling: GET /telemetry/accel/latest         │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ SERVER (Backend - Google Apps Script)                      │
│  - Terima POST request dengan batch data                  │
│  - Simpan ke Google Sheets (sheet: accel)                 │
│  - Query latest data untuk GET request                    │
└─────────────────────────────────────────────────────────────┘
```

## Data Minimal yang Harus Ada

### Identitas Perangkat
- `device_id`: ID unik perangkat (client generate & store locally)

### Timestamp
- `ts` (batch_ts): Waktu batch dikirim ke server
- `sample_ts`: Waktu individual sample direkam oleh sensor

### Isi Batch
Setiap sample dalam `samples[]` berisi:
- `t`: timestamp sensor membaca (ISO 8601)
- `x`: nilai accelerometer sumbu X
- `y`: nilai accelerometer sumbu Y
- `z`: nilai accelerometer sumbu Z

### Di Database (Google Sheets)
Kolom sheet `accel`:
- `device_id`: ID perangkat
- `x, y, z`: nilai accelerometer
- `sample_ts`: waktu sensor membaca
- `batch_ts`: waktu dikirim ke server (dari request body)
- `recorded_at`: waktu disimpan di database (server generate)

## Endpoint API

### 1. Kirim Data Accelerometer (Batch)

**Endpoint:**
```
POST {{BASE_URL}}/telemetry/accel
```

**Request Header:**
```http
Content-Type: text/plain;charset=UTF-8
```

**Request Body:**
```json
{
  "device_id": "dev-001",
  "ts": "2026-02-18T10:15:30Z",
  "samples": [
    {
      "t": "2026-02-18T10:15:29.100Z",
      "x": 0.12,
      "y": 0.01,
      "z": 9.70
    },
    {
      "t": "2026-02-18T10:15:29.300Z",
      "x": 0.15,
      "y": 0.02,
      "z": 9.68
    }
  ]
}
```

**Response (Success):**
```json
{
  "ok": true,
  "data": {
    "accepted": 2
  }
}
```

**Response (Error):**
```json
{
  "ok": false,
  "error": "missing_field: device_id"
}
```

---

### 2. Ambil Data Terbaru (Latest)

**Endpoint:**
```
GET {{BASE_URL}}/telemetry/accel/latest?device_id=dev-001
```

**Response (Success):**
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

**Response (No Data):**
```json
{
  "ok": true,
  "data": {}
}
```

---

## Frontend Implementation

### Files Created

1. **Service Layer**: `src/services/accelerometer-service.ts`
   - `sendAccelBatch()`: Kirim batch data
   - `getAccelLatest()`: Ambil data terbaru

2. **Custom Hook**: `src/hooks/use-accel-latest.ts`
   - `useAccelLatest()`: Hook untuk polling data terbaru dengan auto-refresh

3. **UI Components**:
   - `src/app/dashboard/components/accel-sidebar.tsx`: Display data latest
   - `src/app/dashboard/components/accel-test-comp.tsx`: Component untuk testing/demo

4. **Utils**: `src/utils/accelerometer-collector.ts`
   - `collectAndSendAccelFor()`: Collect sensor data & send to backend
   - Menggunakan Device Motion API (browser)

### Cara Menggunakan

#### Display Latest Data
```tsx
import { AccelSidebar } from "@/app/dashboard/components/accel-sidebar";

export function MyPage() {
  const deviceId = "dev-001";

  return (
    <AccelSidebar 
      deviceId={deviceId}
      title="Accelerometer"
      pollingIntervalMs={2000}
    />
  );
}
```

#### Collect & Send Data (from Browser)
```tsx
import { collectAndSendAccelFor } from "@/utils/accelerometer-collector";

async function handleSendAccel() {
  const response = await collectAndSendAccelFor(
    "dev-001",           // device_id
    5000,                // duration: 5 seconds
    (msg) => console.log(msg)  // message callback
  );

  console.log(response); // { ok: true, data: { accepted: N } }
}
```

#### Manual Hook Usage
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
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && (
        <>
          <p>X: {data.x}</p>
          <p>Y: {data.y}</p>
          <p>Z: {data.z}</p>
          <p>Time: {data.t}</p>
        </>
      )}
    </div>
  );
}
```

---

## Backend Implementation (Google Apps Script)

### Functions in `Code.gs`

#### `batchAccel(body)`
```javascript
function batchAccel(body) {
  requireField(body, 'device_id');
  if (!Array.isArray(body.samples) || body.samples.length === 0) {
    throw new Error('missing_field: samples');
  }

  var sheet = getOrCreateSheet(SHEET.ACCEL);
  var batchTs = body.ts || nowISO();
  var recordedAt = nowISO();

  var rows = body.samples.map(function (sample) {
    return [
      String(body.device_id),
      sample && sample.x !== undefined ? sample.x : 0,
      sample && sample.y !== undefined ? sample.y : 0,
      sample && sample.z !== undefined ? sample.z : 0,
      sample && sample.t ? sample.t : nowISO(),
      batchTs,
      recordedAt,
    ];
  });

  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);

  return {
    accepted: rows.length,
  };
}
```

#### `getAccelLatest(deviceId)`
```javascript
function getAccelLatest(deviceId) {
  if (!deviceId) {
    throw new Error('missing_field: device_id');
  }

  var sheet = getOrCreateSheet(SHEET.ACCEL);
  var data = sheet.getDataRange().getValues();

  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(deviceId)) {
      return {
        t: data[i][4],
        x: data[i][1],
        y: data[i][2],
        z: data[i][3],
      };
    }
  }

  return {};
}
```

### Sheet Structure
Sheet name: `accel`

| Column | Header | Type |
|--------|--------|------|
| A | device_id | String |
| B | x | Number |
| C | y | Number |
| D | z | Number |
| E | sample_ts | DateTime |
| F | batch_ts | DateTime |
| G | recorded_at | DateTime |

---

## Testing

### Via Browser (using Test Component)
1. Buka halaman `/dashboard/mahasiswa/scan`
2. Klik tombol "Kirim Data Accel"
3. Sistem akan mengumpulkan data accelerometer selama 5 detik
4. Data dikirim ke backend dan tersimpan di Google Sheets
5. Sidebar akan menampilkan data terbaru secara real-time

### Persyaratan Browser
- ✅ Dukungan Device Motion API
- ✅ HTTPS atau localhost (security context)
- ✅ Chrome/Firefox/Safari mobile
- ✅ Izin akses sensor (biasanya auto di native app WebView)

### Contoh cURL

```bash
# Kirim batch data
curl -X POST \
  'https://script.google.com/macros/d/[DEPLOYMENT_ID]/usercallback?path=telemetry/accel' \
  -H 'Content-Type: text/plain;charset=UTF-8' \
  -d '{
    "device_id": "dev-001",
    "ts": "2026-02-18T10:15:30Z",
    "samples": [
      {"t": "2026-02-18T10:15:29.100Z", "x": 0.12, "y": 0.01, "z": 9.70},
      {"t": "2026-02-18T10:15:29.300Z", "x": 0.15, "y": 0.02, "z": 9.68}
    ]
  }'

# Ambil data terbaru
curl -X GET \
  'https://script.google.com/macros/d/[DEPLOYMENT_ID]/usercallback?path=telemetry/accel/latest&device_id=dev-001'
```

---

## Bonus Features

### Real-time Chart
Bisa di-implement menggunakan:
- `recharts` (React Chart Library)
- `chart.js`
- Custom SVG visualization

### Data History
Endpoint GET `/telemetry/accel/history?device_id=dev-001&limit=100` (jika ingin)

### Batch Configuration
UI untuk customize batch duration, polling interval, dsb.

---

## Status Implementasi

✅ Backend API (Google Apps Script)
- ✅ POST /telemetry/accel → batchAccel()
- ✅ GET /telemetry/accel/latest → getAccelLatest()
- ✅ Google Sheets integration

✅ Frontend Services & Hooks
- ✅ accelerometer-service.ts
- ✅ use-accel-latest.ts hook

✅ UI Components
- ✅ AccelSidebar: Display latest data
- ✅ AccelTestComp: Test/demo component

✅ Utilities
- ✅ accelerometer-collector.ts: Collect & send

✅ Integration
- ✅ Added to /dashboard/mahasiswa/scan

⏳ Future (Optional)
- ⏳ Real-time chart visualization
- ⏳ Historical data endpoint
- ⏳ Advanced filtering/querying
