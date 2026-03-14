import { expect, test } from "@playwright/test";

type GpsPoint = {
  ts: string;
  lat: number;
  lng: number;
  accuracy_m?: number | null;
  altitude_m?: number | null;
};

function parseGpsPath(urlString: string) {
  const url = new URL(urlString);
  return url.searchParams.get("path");
}

test("modul 3 gps: sender mengirim titik lalu map membaca latest dan history", async ({
  page,
}) => {
  test.skip(
    !process.env.NEXT_PUBLIC_GAS_BASE_URL,
    "NEXT_PUBLIC_GAS_BASE_URL harus diset agar mode direct GAS aktif.",
  );

  const points: GpsPoint[] = [];
  let latestRequestCount = 0;
  let historyRequestCount = 0;

  await page.addInitScript(() => {
    let watcherId = 0;

    Object.defineProperty(window.navigator, "geolocation", {
      configurable: true,
      value: {
        watchPosition(success: PositionCallback) {
          watcherId += 1;
          const position: GeolocationPosition = {
            coords: {
              latitude: -7.2575,
              longitude: 112.7521,
              accuracy: 12.5,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: () => ({}),
            },
            timestamp: Date.now(),
            toJSON: () => ({}),
          };
          setTimeout(() => success(position), 0);
          return watcherId;
        },
        clearWatch() {
          return;
        },
        getCurrentPosition() {
          return;
        },
      },
    });
  });

  await page.route("**/exec?**", async (route) => {
    const request = route.request();
    const method = request.method();
    const path = parseGpsPath(request.url());

    if (method === "POST" && path === "telemetry/gps") {
      const rawBody = request.postData() ?? "{}";
      const payload = JSON.parse(rawBody) as {
        device_id: string;
        ts?: string;
        lat: number;
        lng: number;
        accuracy_m?: number | null;
        altitude_m?: number | null;
      };
      points.push({
        ts: payload.ts ?? new Date().toISOString(),
        lat: payload.lat,
        lng: payload.lng,
        accuracy_m: payload.accuracy_m ?? null,
        altitude_m: payload.altitude_m ?? null,
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: { accepted: true } }),
      });
      return;
    }

    if (method === "GET" && path === "telemetry/gps/latest") {
      latestRequestCount += 1;
      const latest = points.at(-1) ?? {
        ts: null,
        lat: null,
        lng: null,
        accuracy_m: null,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: latest }),
      });
      return;
    }

    if (method === "GET" && path === "telemetry/gps/history") {
      historyRequestCount += 1;
      const url = new URL(request.url());
      const limit = Number(url.searchParams.get("limit") ?? "200");
      const fromRaw = url.searchParams.get("from");
      const toRaw = url.searchParams.get("to");
      const from = fromRaw ? new Date(fromRaw) : null;
      const to = toRaw ? new Date(toRaw) : null;

      const filtered = points
        .filter((point) => {
          const pointTs = new Date(point.ts);
          if (from && pointTs < from) return false;
          if (to && pointTs > to) return false;
          return true;
        })
        .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            device_id: "telemetry-web-test",
            items: filtered.slice(Math.max(filtered.length - limit, 0)),
          },
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/gps/sender");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByText("GPS aktif.", { exact: false })).toBeVisible();
  await expect.poll(() => points.length, { timeout: 15_000 }).toBeGreaterThan(0);

  await page.goto("/gps/map");
  await expect.poll(() => latestRequestCount, { timeout: 15_000 }).toBeGreaterThan(
    0,
  );
  await expect.poll(() => historyRequestCount, { timeout: 15_000 }).toBeGreaterThan(
    0,
  );
  await expect(page.getByText("-7.257500")).toBeVisible();
  await expect(page.getByText("112.752100")).toBeVisible();
});

test("modul 3 gps: sender menampilkan status denied saat izin lokasi ditolak", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "geolocation", {
      configurable: true,
      value: {
        watchPosition(
          _success: PositionCallback,
          error?: PositionErrorCallback,
        ) {
          setTimeout(
            () =>
              error?.({
                code: 1,
                message: "permission denied",
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3,
              } as GeolocationPositionError),
            0,
          );
          return 1;
        },
        clearWatch() {
          return;
        },
        getCurrentPosition() {
          return;
        },
      },
    });
  });

  await page.goto("/gps/sender");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(
    page.getByText("Akses GPS ditolak: permission denied"),
  ).toBeVisible();
});
