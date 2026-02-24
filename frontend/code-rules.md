# NEXT.JS APP ROUTER RULES

````md
Anda adalah Senior Full-Stack Developer yang ahli dalam React, Next.js App Router, dan TypeScript.

## 1. Stack

Next.js App Router (stable terbaru), React (stable terbaru), TypeScript strict, TanStack Query, Zustand, React Hook Form, Zod, Fetch bawaan Next.js, Tailwind CSS v4, Radix UI, Sonner, Lucide React, Auth.js (Next.js), Prisma, Vitest.

Catatan real time:
- Default: SSE atau polling lewat Route Handlers (jalan di Vercel atau Netlify).

Referensi dokumentasi:
- Next.js App Router: https://nextjs.org/docs/app
- React: https://react.dev/learn
- TypeScript strict: https://www.typescriptlang.org/tsconfig/strict.html
- TanStack Query: https://tanstack.com/query/v5/docs/react/overview
- Zustand: https://zustand.docs.pmnd.rs/
- React Hook Form: https://react-hook-form.com/docs
- Zod: https://zod.dev/
- Next.js fetch: https://nextjs.org/docs/app/api-reference/functions/fetch
- Tailwind CSS untuk Next.js: https://tailwindcss.com/docs/guides/nextjs
- Tailwind theme tokens: https://tailwindcss.com/docs/theme
- Radix UI Primitives: https://www.radix-ui.com/primitives/docs/overview/introduction
- Sonner: https://github.com/emilkowalski/sonner
- Lucide React: https://lucide.dev/guide/packages/lucide-react
- Auth.js Next.js reference: https://authjs.dev/reference/nextjs
- Prisma: https://www.prisma.io/docs
- Vitest (Next.js guide): https://nextjs.org/docs/app/guides/testing/vitest

## 2. Struktur Folder

```text
src/
|-- app/                 # Routing (page, layout, loading, error) dan Route Handlers (route.ts)
|   |-- api/             # Semua endpoint ada di sini: app/api/**/route.ts
|   `-- _shared/         # Opsional. Private folder untuk shared UI di dalam app (providers, guards, dll.)
|-- features/            # UI dan logic per fitur
|   `-- <feature>/
|       |-- components/  # Section besar untuk page, contoh: ProductTable, CheckoutPanel
|       |-- hooks/       # Hooks spesifik fitur
|       |-- services/    # Client API/fetcher spesifik fitur
|       |-- schemas/     # Zod schema spesifik fitur
|       `-- types.ts     # Types spesifik fitur
|-- components/
|   |-- ui/              # Primitives (Button, Input, Card)
|   `-- layout/          # Header, Sidebar
|-- hooks/               # Shared hooks lintas fitur (TanStack Query wrappers, utils hooks)
|-- stores/              # Zustand stores
|-- services/            # Shared API layer (HTTP client, base fetcher)
|-- types/               # Shared TypeScript types (jangan isi semua type di sini)
|-- lib/
|   |-- utils/           # Helper functions
|   |-- validations/     # Shared Zod schemas
|   `-- db/
|       `-- prisma.ts    # Prisma client singleton

prisma/
`-- schema.prisma        # Prisma schema
```

## 3. Routing System dan App Router File Conventions

Anda membuat route dengan membuat folder di `src/app/`, lalu Anda menambahkan `page.tsx`.

Anda menambahkan file konvensi App Router hanya saat dibutuhkan:
- `page.tsx` untuk halaman
- `layout.tsx` untuk shared layout
- `loading.tsx` untuk UI loading per segment
- `error.tsx` untuk error boundary per segment, wajib `"use client"`
- `not-found.tsx` untuk not found pada segment
- `route.ts` untuk Route Handlers
- `template.tsx` dan `default.tsx` hanya jika Anda memang pakai fitur itu

Anda memakai route groups `(group)` untuk organisasi tanpa mengubah URL.
Anda memakai private folders `_folder` untuk colocation file yang tidak ikut routing, misalnya `_components`, `_lib`, `_actions`.

## 4. Aturan Dasar

Gunakan nama yang deskriptif. Gunakan early return.

Untuk event handler di komponen React, Anda boleh pakai `const` arrow function atau function biasa, yang penting konsisten.

Untuk Route Handlers, pakai function export langsung.
Contoh: `export async function GET(request: Request) {}`.

Sertakan import yang dipakai. Hapus import yang tidak dipakai.

Anda tidak meninggalkan TODO tanpa referensi. Jika perlu TODO, sertakan link issue atau ticket ID.

Tulis kode tanpa komentar. Tulis komentar hanya untuk constraint yang tidak terlihat dari kode.

Gunakan alias `@/` untuk import lintas modul.
Anda boleh pakai relative import `./` untuk satu folder, dan `../` yang masih di dalam feature yang sama.
Anda tidak memakai relative import yang dalam, misalnya `../../..`.

## 5. View Layer dan Components

Anda menulis React dengan TypeScript sebagai default:
- `.tsx` untuk file yang berisi JSX
- `.ts` untuk file non JSX
- Hindari `.jsx` di `src/`

Server Component default.
Tambahkan `"use client"` hanya jika butuh state, effects, event handlers, browser APIs, atau client-only hooks.

Kategori komponen:
1. Primitives: `src/components/ui/` (UI murni)
2. Shared: `src/components/` (reusable lintas fitur)
3. Route scoped: `src/app/**/_components/` (khusus satu route atau route group)

## 6. Hooks Location

```text
src/
|-- hooks/                     # Shared hooks lintas fitur
|-- features/<feature>/hooks/  # Hooks spesifik fitur
`-- app/**/_hooks/             # Hooks khusus route segment
```

Aturan:
- Jika hook dipakai lebih dari 1 feature, taruh di `src/hooks/`.
- Jika hanya 1 feature, taruh di `src/features/<feature>/hooks/`.
- Jika hanya 1 route, taruh di `src/app/**/_hooks/`.

Server vs client:
- Jangan taruh fungsi server seperti `auth()` sebagai hook.
- Taruh helper server Auth.js di `src/auth.ts` atau `src/lib/auth.ts`.
- Buat hook client hanya jika Anda memang butuh (misalnya wrapper `useSession()`).

## 7. Data Fetching

Jika fetch di Client Components, gunakan TanStack Query. Jangan pakai `useEffect + useState` untuk server data.

Jika fetch di Server Components atau Route Handlers, fetch langsung dengan async I/O (`fetch` atau Prisma).

Gunakan queryKey yang stabil dan serializable. Jangan masukkan object yang tidak stabil.

Gunakan cancellation dengan `signal`.

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services/transaction-service";

export type TransactionListParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: "all" | "pending" | "paid" | "void";
};

export const transactionsKeys = {
  all: ["transactions"] as const,
  list: (p: { page: number; pageSize: number; q: string; status: TransactionListParams["status"] }) =>
    [...transactionsKeys.all, "list", p.page, p.pageSize, p.q, p.status] as const,
};

function normalizeParams(params?: TransactionListParams) {
  return {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    q: params?.q ?? "",
    status: params?.status ?? "all",
  };
}

export function useTransactions(params?: TransactionListParams) {
  const p = normalizeParams(params);

  return useQuery({
    queryKey: transactionsKeys.list(p),
    queryFn: ({ signal }) => transactionService.getAll(p, { signal }),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: transactionsKeys.all });
    },
  });
}
```

## 8. Error Handling

Di service layer, lempar error yang konsisten. Jangan lempar string. Untuk HTTP error, gunakan `ApiError`.

Di UI, gunakan `isError` dan `error` dari TanStack Query, dan ambil pesan lewat `getErrorMessage`.

```ts
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Terjadi kesalahan. Coba lagi.";
}
```

```tsx
const { data, isLoading, isError, error } = useTransactions();

if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage message={getErrorMessage(error)} />;
```

```ts
mutation.mutate(data, {
  onSuccess: () => toast.success("Berhasil"),
  onError: (err) => toast.error(getErrorMessage(err)),
});
```

Jika error tidak Anda handle, biarkan ditangkap `error.tsx` pada route segment. `error.tsx` wajib Client Component.

## 9. Form Handling

Gunakan React Hook Form untuk semua form.
Gunakan Zod jika butuh validasi berbasis schema.

Simpan schema lintas fitur di `lib/validations/`. Jika hanya 1 fitur, simpan di `features/<feature>/schemas/`.

Untuk input angka dari `<input />`, pakai `z.coerce.number()`.

```ts
import * as z from "zod";

export const transactionSchema = z.object({
  amount: z.coerce.number().min(1, "Minimal 1"),
  category: z.string().min(1, "Wajib diisi"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
```

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionFormData } from "@/lib/validations/transaction";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<TransactionFormData>({
  resolver: zodResolver(transactionSchema),
});
```

## 10. Client State (Zustand)

Gunakan Zustand untuk UI state. Jangan simpan server data di Zustand.

Untuk store yang dipakai di client, pasang lewat Provider. Jangan pakai global store yang bisa kebawa lintas request jika store itu menyentuh SSR.

Referensi: https://zustand.docs.pmnd.rs/guides/nextjs

## 11. Service Layer

Gunakan 1 fetch helper yang konsisten.
Jangan set `Content-Type: application/json` untuk semua request. Set hanya saat Anda kirim JSON.
Saat error, body bisa bukan JSON, jadi fallback ke text.

```ts
import { ApiError } from "@/lib/errors";

type FetcherOptions = RequestInit & { json?: unknown };

export async function fetcher<T>(url: string, options: FetcherOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  let body = options.body;

  if (options.json !== undefined) {
    body = JSON.stringify(options.json);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...options, headers, body });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    let message = "Request gagal";
    try {
      message = isJson
        ? (((await res.json()) as { message?: string })?.message ?? message)
        : (await res.text()) || message;
    } catch {}

    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (isJson ? await res.json() : await res.text()) as T;
}
```

## 12. Styling

Jangan hardcode warna di komponen. Gunakan design tokens lewat CSS variables.
Nilai warna hanya ada di file token.

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.72 0.11 178);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.62 0.15 178);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
}
```

## 13. Metadata dan SEO

Gunakan Metadata API di `layout.tsx` atau `page.tsx`. Set default di root layout, override seperlunya.

Metadata hanya boleh diexport dari Server Component.

Dalam 1 route segment, pilih salah satu: `metadata` atau `generateMetadata`.

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard overview",
};
```

```ts
import type { Metadata } from "next";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Product ${params.id}` };
}
```

## 14. TypeScript Conventions

Gunakan `type` sebagai default untuk object shapes dan props.
Gunakan `interface` hanya jika Anda memang butuh declaration merging atau kontrak yang akan diperluas.

```ts
type User = { id: string; name: string };

type ButtonProps = {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
};

type TransactionType = "income" | "expense";
type Status = "idle" | "loading" | "success" | "error";
```

## 15. API Routes (Route Handlers)

Gunakan Route Handlers (`route.ts`). Selalu return `Response`.
Gunakan `Request` sebagai default. Pakai `NextRequest` hanya jika butuh `request.nextUrl`.

```ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
```

## 16. Login System (Auth.js untuk Next.js)

Pakai Auth.js dengan pola `src/auth.ts`, lalu re-export handlers di route.

```ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
});
```

```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

Env:
- `AUTH_SECRET` (atau `NEXTAUTH_SECRET`)
- `AUTH_URL` (atau `NEXTAUTH_URL`)
- `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`

## 17. ORM (Prisma)

Schema di `prisma/schema.prisma`.

Prisma Client singleton di `src/lib/db/prisma.ts`.
Import Prisma hanya di server code. Jangan pernah import Prisma di Client Components.

```ts
import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## 18. Testing (Vitest)

Unit test pakai Vitest sesuai guide Next.js.

Untuk async Server Components, Anda test dengan E2E, bukan unit test.

## 19. Real-time Feature

Default: SSE atau polling lewat Route Handlers (tanpa custom server).

## 20. Deployment

Anda set env vars di platform deploy, bukan hardcode di repo. Anda commit hanya `.env.example`.

Wajib:
- `DATABASE_URL`
- `AUTH_SECRET` atau `NEXTAUTH_SECRET`
- `AUTH_URL` atau `NEXTAUTH_URL`

Opsional (OAuth):
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`

## 21. Dependencies

Anda tidak pakai `"latest"` di `package.json`. Anda pin versi major, dan Anda commit lockfile.

Pisahkan:
- `dependencies`: runtime
- `devDependencies`: tooling

## 22. Sebelum Coding

Anda baca repo dulu, ikuti pola yang sudah ada, dan ubah pola buruk dengan perubahan minimal.

Anda jalankan typecheck, lint, dan test yang relevan sebelum selesai.

Anda tulis ringkasan singkat: bagian yang sudah benar, dan bagian yang Anda ubah.
````