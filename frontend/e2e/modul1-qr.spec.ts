import { expect, test } from "@playwright/test";
import { parseLecturerActiveQrState } from "./helpers/lecturer-active-qr";

const mahasiswaPrimary = {
  identifier: "434231079",
  password: "434231079",
  name: "Sayu Damar Yunan",
};

const mahasiswaSecondary = {
  identifier: "434231065",
  name: "Andino Ferdiansah",
};

const dosenSession = {
  identifier: "198701012020011001",
  role: "dosen",
  name: "Dosen CloudTrack",
};

async function waitForActiveQrState(
  page: import("@playwright/test").Page,
  expectedCourseId: string,
) {
  const deadline = Date.now() + 60_000;
  let lastRawValue: string | null = null;

  while (Date.now() < deadline) {
    lastRawValue = await page.evaluate(() =>
      window.localStorage.getItem("ctc_dosen_active_qr"),
    );

    try {
      const parsed = parseLecturerActiveQrState(lastRawValue);
      const isValidSession = /-p01$/i.test(parsed.session_id);
      if (
        parsed.course_id === expectedCourseId &&
        isValidSession &&
        parsed.qr_token.trim() !== ""
      ) {
        return parsed;
      }
    } catch {
      // Keep polling until timeout to tolerate slow GAS response.
    }

    await page.waitForTimeout(500);
  }

  const processingVisible = await page
    .getByRole("button", { name: "Memproses..." })
    .isVisible()
    .catch(() => false);
  const rotationErrorVisible = await page
    .getByText("Rotasi QR gagal sementara", { exact: false })
    .isVisible()
    .catch(() => false);
  const meetingOutOfRangeVisible = await page
    .getByText("meeting_no_out_of_range", { exact: false })
    .isVisible()
    .catch(() => false);
  const invalidSessionVisible = await page
    .getByText("invalid_session_id_for_meeting", { exact: false })
    .isVisible()
    .catch(() => false);

  throw new Error(
    [
      "Generate QR did not produce a valid active payload within 60s.",
      `lastRawValue=${lastRawValue ?? "null"}`,
      `processingVisible=${processingVisible}`,
      `rotationErrorVisible=${rotationErrorVisible}`,
      `meetingOutOfRangeVisible=${meetingOutOfRangeVisible}`,
      `invalidSessionVisible=${invalidSessionVisible}`,
    ].join(" "),
  );
}

async function bootstrapDosenSession(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.evaluate((session) => {
    window.sessionStorage.setItem(
      "ctc_auth_session",
      JSON.stringify({
        ...session,
        login_at: new Date().toISOString(),
      }),
    );
  }, dosenSession);
}

async function bootstrapMahasiswaSession(
  page: import("@playwright/test").Page,
  session: { identifier: string; name: string },
) {
  await page.goto("/login");
  await page.evaluate((payload) => {
    window.sessionStorage.setItem(
      "ctc_auth_session",
      JSON.stringify({
        ...payload,
        role: "mahasiswa",
        login_at: new Date().toISOString(),
      }),
    );
  }, session);
}

test("modul 1 qr: mahasiswa login via form", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "NIM / NIP" }).fill(mahasiswaPrimary.identifier);
  await page.getByRole("textbox", { name: "Password" }).fill(mahasiswaPrimary.password);
  await page.getByRole("button", { name: "Masuk" }).click();

  await expect(page).toHaveURL(/\/dashboard\/mahasiswa\/scan$/);
  await expect(page.getByRole("heading", { name: "Scan QR Presensi" })).toBeVisible();
});

test("modul 1 qr: dosen generate, mahasiswa checkin, duplicate, stop session", async ({ page }) => {
  test.setTimeout(120_000);
  const uniqueCourseId = `qa-e2e-${Date.now()}`;

  await bootstrapDosenSession(page);
  await page.goto("/dashboard/dosen/buat-qr");
  await page.locator('input[name="course_id"]').fill(uniqueCourseId);
  await page.getByRole("button", { name: "Generate QR" }).click();

  const activeQr = await waitForActiveQrState(page, uniqueCourseId);

  await bootstrapMahasiswaSession(page, mahasiswaSecondary);
  await page.goto("/dashboard/mahasiswa/scan");
  await page.locator('input[name="course_id"]').fill(activeQr.course_id);
  await page.locator('input[name="session_id"]').fill(activeQr.session_id);
  await page.locator('input[name="qr_token"]').fill(activeQr.qr_token);
  await page.getByRole("button", { name: "Check-in Sekarang" }).click();

  await expect(page.getByText("Check-in berhasil.")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/presence_id:/)).toBeVisible();

  await page.getByRole("button", { name: "Check-in Sekarang" }).click();
  await expect(page.getByText("Anda sudah check-in pada sesi ini.")).toBeVisible({
    timeout: 20_000,
  });

  await bootstrapDosenSession(page);
  await page.goto("/dashboard/dosen/buat-qr");
  await waitForActiveQrState(page, uniqueCourseId);
  await page.getByRole("button", { name: "Stop QR" }).click();
  await expect(page.getByText("Stopped")).toBeVisible({ timeout: 30_000 });

  await page.goto("/dashboard/dosen/monitor");
  await expect(page.getByText("Riwayat Sesi Monitor")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(`${uniqueCourseId} - Pertemuan 1 (stopped)`)).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText(mahasiswaSecondary.identifier)).toBeVisible({ timeout: 20_000 });

  await bootstrapMahasiswaSession(page, mahasiswaPrimary);
  await page.goto("/dashboard/mahasiswa/scan");
  await page.locator('input[name="course_id"]').fill(activeQr.course_id);
  await page.locator('input[name="session_id"]').fill(activeQr.session_id);
  await page.locator('input[name="qr_token"]').fill(activeQr.qr_token);
  await page.getByRole("button", { name: "Check-in Sekarang" }).click();
  await expect(page.getByText("Sesi presensi sudah ditutup dosen.")).toBeVisible({
    timeout: 20_000,
  });
});
