import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      message:
        "Registrasi publik dinonaktifkan. Hubungi admin untuk dibuatkan akun staff POS.",
    },
    { status: 403 }
  );
}
