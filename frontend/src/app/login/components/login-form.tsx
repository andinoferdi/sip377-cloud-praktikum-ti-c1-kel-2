"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AUTH_SEED_USERS } from "@/schemas/seeder";
import { getDashboardPathByRole } from "@/lib/auth/paths";
import { setAuthSession } from "@/lib/auth/session";
import { verifyPasswordHash } from "@/lib/auth/password";
import { loginSchema, type LoginSchema } from "@/schemas/login.schema";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const INPUT_BASE =
  "h-11 w-full rounded-lg border bg-(--token-white) px-3 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)";

const INPUT_NORMAL =
  "border-(--token-gray-300) dark:border-(--color-marketing-dark-border)";

const INPUT_ERROR =
  "border-red-500 focus:border-red-500 dark:border-red-500";

const InputGroup = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-[0.06em] text-(--token-gray-400) dark:text-(--token-gray-500)"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={[INPUT_BASE, error ? INPUT_ERROR : INPUT_NORMAL, className]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={Boolean(error)}
        />
        {error ? (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        ) : null}
      </div>
    );
  },
);

InputGroup.displayName = "InputGroup";

const PasswordInput = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-[0.06em] text-(--token-gray-400) dark:text-(--token-gray-500)"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            {...props}
            type={visible ? "text" : "password"}
            className={[
              INPUT_BASE,
              "pr-10",
              error ? INPUT_ERROR : INPUT_NORMAL,
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={Boolean(error)}
          />
          <button
            type="button"
            aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
            onClick={() => setVisible((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-(--token-gray-400) hover:bg-(--token-gray-100) hover:text-(--token-gray-700) dark:text-(--token-gray-500) dark:hover:bg-(--token-white-5) dark:hover:text-(--token-gray-300) transition-colors"
          >
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {error ? (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        ) : null}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: LoginSchema) {
    const normalizedIdentifier = data.identifier.trim();
    const user = AUTH_SEED_USERS.find(
      (seedUser) => seedUser.identifier === normalizedIdentifier,
    );

    if (!user) {
      toast.error("NIM/NIP tidak terdaftar");
      return;
    }

    let isValidPassword = false;
    try {
      isValidPassword = await verifyPasswordHash({
        password: data.password,
        saltHex: user.salt,
        expectedHash: user.password_hash,
        iterations: user.iterations,
      });
    } catch {
      toast.error("Verifikasi password gagal. Coba refresh halaman.");
      return;
    }

    if (!isValidPassword) {
      toast.error("Password salah");
      return;
    }

    setAuthSession({
      identifier: user.identifier,
      role: user.role,
      name: user.name,
      login_at: new Date().toISOString(),
    });

    toast.success("Login berhasil");
    router.replace(getDashboardPathByRole(user.role));
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-5">
        <InputGroup
          label="NIM / NIP"
          type="text"
          placeholder="Contoh: 20230001"
          autoComplete="username"
          disabled={isSubmitting}
          error={form.formState.errors.identifier?.message}
          {...form.register("identifier")}
        />

        <PasswordInput
          label="Password"
          placeholder="Masukkan password"
          autoComplete="current-password"
          disabled={isSubmitting}
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 active:opacity-70 disabled:opacity-50 dark:hover:opacity-90"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </button>
      </div>
    </form>
  );
}