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
import {
  loginSchema,
  type LoginSchema,
} from "@/schemas/login.schema";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const InputGroup = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300)"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={[
            "h-11 w-full rounded-xl border border-(--token-gray-300) bg-(--token-white) px-3 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)",
            error ? "border-red-500 focus:border-red-500 dark:border-red-500" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={Boolean(error)}
        />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
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
          className="block text-sm font-medium text-(--token-gray-700) dark:text-(--token-gray-300)"
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
              "h-11 w-full rounded-xl border border-(--token-gray-300) bg-(--token-white) px-3 pr-10 text-sm text-(--token-gray-900) outline-none transition-colors placeholder:text-(--token-gray-400) focus:border-primary-500 dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) dark:text-(--token-white-90) dark:placeholder:text-(--token-gray-500)",
              error ? "border-red-500 focus:border-red-500 dark:border-red-500" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={Boolean(error)}
          />
          <button
            type="button"
            aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
            onClick={() => setVisible((previous) => !previous)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-(--token-gray-500) hover:bg-(--token-gray-100) dark:text-(--token-gray-400) dark:hover:bg-(--token-white-5)"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
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
          label="NIM/NIP"
          type="text"
          placeholder="Contoh: 20230001 atau 198701012020011001"
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
          className="gradient-btn w-full rounded-full py-3 px-6 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 disabled:hover:scale-100"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </button>
      </div>
    </form>
  );
}
