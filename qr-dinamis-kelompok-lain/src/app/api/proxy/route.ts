import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "../../config";

// ------------------------------------------------------------------
//  Proxy: client → Next.js server → GAS
//
//  GAS mengembalikan 401 untuk POST dengan pathInfo dari server-side.
//  Solusi: POST ke /exec?action=... (query param) dan juga inject
//  action di body sebagai double-safety.
//  GAS membaca route dari e.parameter.action atau body.action.
//
//  Swagger support: jika query param `gasUrl` ada, gunakan sebagai
//  target URL (override BASE_URL). Ini memungkinkan Swagger UI
//  testing dengan GAS URL custom.
// ------------------------------------------------------------------

function resolveBaseUrl(searchParams: URLSearchParams): string {
    const customGasUrl = searchParams.get("gasUrl");
    if (customGasUrl) {
        // Validate the URL is a GAS URL
        try {
            const url = new URL(customGasUrl);
            if (url.hostname === "script.google.com") {
                return customGasUrl;
            }
        } catch {
            // ignore invalid URLs
        }
    }
    return BASE_URL;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const baseUrl = resolveBaseUrl(searchParams);

    if (!baseUrl) {
        return NextResponse.json(
            { ok: false, error: "BASE_URL not configured. Set gasUrl query param or NEXT_PUBLIC_BASE_URL env." },
            { status: 500 }
        );
    }

    const path = searchParams.get("path") || "";

    const targetParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
        if (key !== "path" && key !== "gasUrl") targetParams.set(key, value);
    });
    // Tambahkan action sebagai query param untuk GAS routing
    if (path) targetParams.set("action", path);

    const targetUrl = `${baseUrl}${targetParams.toString() ? "?" + targetParams.toString() : ""}`;

    try {
        const response = await fetch(targetUrl, {
            method: "GET",
            redirect: "follow",
        });
        const data = await response.text();
        return new NextResponse(data, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: "proxy_error: " + (err as Error).message },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const baseUrl = resolveBaseUrl(searchParams);

    if (!baseUrl) {
        return NextResponse.json(
            { ok: false, error: "BASE_URL not configured. Set gasUrl query param or NEXT_PUBLIC_BASE_URL env." },
            { status: 500 }
        );
    }

    const path = searchParams.get("path") || "";

    try {
        const originalBody = JSON.parse(await req.text());
        // Inject action di body juga
        const enrichedBody = { ...originalBody, action: path };

        // Debug log (visible in Vercel function logs)
        console.log("[PROXY POST]", { path, qr_token: originalBody.qr_token, user_id: originalBody.user_id });

        // POST ke /exec?action=... (TANPA pathInfo, pakai query param)
        const targetUrl = `${baseUrl}?action=${encodeURIComponent(path)}`;

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(enrichedBody),
            redirect: "manual",
        });

        // GAS returns 302 → follow redirect
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get("location");
            if (location) {
                const redirectRes = await fetch(location, {
                    method: "GET",
                    redirect: "follow",
                });
                const data = await redirectRes.text();

                if (data.trim().startsWith("<!DOCTYPE") || data.trim().startsWith("<html")) {
                    return NextResponse.json(
                        { ok: false, error: "GAS returned HTML. Deploy ulang GAS dengan code terbaru." },
                        { status: 502 }
                    );
                }

                return new NextResponse(data, {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        const data = await response.text();
        if (data.trim().startsWith("<!DOCTYPE") || data.trim().startsWith("<html")) {
            return NextResponse.json(
                { ok: false, error: "GAS returned HTML. Deploy ulang GAS dengan code terbaru." },
                { status: 502 }
            );
        }

        return new NextResponse(data, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: "proxy_error: " + (err as Error).message },
            { status: 500 }
        );
    }
}
