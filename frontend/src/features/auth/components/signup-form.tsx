"use client";

import { Checkbox } from "@/components/ui/inputs/checkbox";
import { Input, InputGroup } from "@/components/ui/inputs";
import { Label } from "@/components/ui/label";
import { authValidation } from "@/features/auth/schemas/auth.schema";
import { authService } from "@/features/auth/services/auth-service";
import { EyeCloseIcon, EyeIcon } from "@/icons/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

type Inputs = z.infer<typeof authValidation.register>;

export default function SignupForm() {
  const form = useForm<Inputs>({
    resolver: zodResolver(authValidation.register),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const [rememberMe, setRememberMe] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  async function onSubmit(data: Inputs) {
    setIsLoading(true);

    try {
      await authService.register(data);

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: "/portal",
      });

      if (!signInResult || signInResult.error) {
        toast.success("Akun berhasil dibuat. Silakan login.");
        router.push("/login");
        setIsLoading(false);
        return;
      }

      toast.success("Akun berhasil dibuat");
      router.push(signInResult.url ?? "/portal");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan saat mendaftar";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Controller
          control={form.control}
          name="firstName"
          render={({ field, fieldState }) => (
            <InputGroup
              label="First name"
              placeholder="Your first name"
              disabled={isLoading}
              {...field}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name="lastName"
          render={({ field, fieldState }) => (
            <InputGroup
              label="Last name"
              placeholder="Your last name"
              disabled={isLoading}
              {...field}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <InputGroup
              type="email"
              label="Email address"
              placeholder="Your email address"
              groupClassName="col-span-full"
              disabled={isLoading}
              {...field}
              error={fieldState.error?.message}
            />
          )}
        />

        <div className="col-span-full">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              type={isShowPassword ? "text" : "password"}
              placeholder="Enter your password"
              id="password"
              disabled={isLoading}
              {...form.register("password")}
            />

            <button
              type="button"
              title={isShowPassword ? "Hide password" : "Show password"}
              aria-label={isShowPassword ? "Hide password" : "Show password"}
              onClick={handleShowPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--token-gray-400)] dark:text-[var(--token-gray-600)]"
            >
              {isShowPassword ? <EyeIcon /> : <EyeCloseIcon />}
            </button>
          </div>

          {form.formState.errors.password && (
            <p className="text-[var(--token-red-500)] text-sm mt-1.5">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Checkbox
          label="Keep me logged in"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          name="remember_me"
          className="col-span-full"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary-500 hover:bg-primary-600 transition py-3 px-6 w-full font-medium text-[var(--token-white)] text-sm rounded-full col-span-full disabled:opacity-75"
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </div>
    </form>
  );
}
