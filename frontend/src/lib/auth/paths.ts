import type { AuthRole } from "@/types/auth";

export function getDashboardPathByRole(role: AuthRole) {
  return role === "dosen"
    ? "/dashboard/dosen/buat-qr"
    : "/dashboard/mahasiswa/scan";
}
