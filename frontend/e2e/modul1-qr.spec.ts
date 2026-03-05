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

  await bootstrapDosenSession(page);
  await page.goto("/dashboard/dosen/buat-qr");
  await page.getByRole("button", { name: "Generate QR" }).click();

  await expect(page.getByText("Active")).toBeVisible({ timeout: 20_000 });

  const rawActiveState = await page.evaluate(() =>
    window.localStorage.getItem("ctc_dosen_active_qr"),
  );
  const activeQr = parseLecturerActiveQrState(rawActiveState);

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
  await page.getByRole("button", { name: "Stop QR" }).click();
  await expect(page.getByText("Stopped")).toBeVisible({ timeout: 20_000 });

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
