"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePOSInstances } from "@/features/portal/hooks/use-pos-instances";
import POSInstanceCard from "@/features/portal/components/pos-instance-card";
import POSInstanceForm from "@/features/portal/components/pos-instance-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import type { RoleCode } from "@/types/rbac";

export default function PortalPage() {
  const { data: session } = useSession();
  const { data: instances, isLoading } = usePOSInstances();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const roleCode = (session?.user?.roleCode as RoleCode) ?? null;
  const isAdmin = roleCode === "admin";
  const hasInstances = (instances?.length ?? 0) > 0;

  return (
    <div className="portal-theme-scope surface-base relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-(--token-white) via-(--token-gray-50) to-brand-50 dark:from-[var(--color-surface-dark-base)] dark:via-[var(--color-surface-dark-base)] dark:to-[var(--color-surface-dark-subtle)]" />
      <div className="pointer-events-none absolute -left-28 top-14 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-12 lg:pt-16">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white)">
              POS Outlets
            </h1>
            <p className="mt-1 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
              Pilih outlet untuk mulai operasional POS
            </p>
          </div>
          {isAdmin && !isLoading && hasInstances && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-semibold text-[var(--token-white)] shadow-sm transition-colors hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Tambah POS Instance
            </button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        )}

        {!isLoading && (!instances || instances.length === 0) && (
          <div className="surface-elevated relative min-h-[58vh] overflow-hidden rounded-3xl border border-dashed border-strong">
            <div className="pointer-events-none absolute -left-16 top-6 h-40 w-40 rounded-full bg-primary-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-4 h-44 w-44 rounded-full bg-brand-500/20 blur-3xl" />

            <div className="relative flex min-h-[58vh] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-600 dark:bg-primary-500/25 dark:text-primary-300">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h10" />
                </svg>
              </div>
              <p className="text-3xl font-semibold text-(--token-gray-800) dark:text-(--token-white)">
                Belum ada POS Instance
              </p>
              <p className="mt-2 max-w-lg text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
                Buat outlet pertama Anda untuk mulai operasional kasir, kelola meja, dan pantau transaksi dari satu tempat.
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  aria-label="Tambah POS Instance pertama"
                  title="Tambah POS Instance pertama"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-[var(--token-white)] shadow-sm transition-colors hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah POS Instance
                </button>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <span className="surface-subtle rounded-full border border-soft px-3 py-1 text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  Table Service
                </span>
                <span className="surface-subtle rounded-full border border-soft px-3 py-1 text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  Tab Service
                </span>
              </div>
            </div>
          </div>
        )}

        {!isLoading && instances && instances.length > 0 && (
          <div className="surface-elevated rounded-3xl border border-soft p-4 backdrop-blur-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {instances.map((instance) => (
                <POSInstanceCard
                  key={instance.id}
                  instance={instance}
                  roleCode={roleCode}
                />
              ))}
            </div>
          </div>
        )}

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="surface-elevated border border-soft">
            <DialogHeader>
              <DialogTitle className="text-(--token-gray-900) dark:text-(--token-white)">
                Tambah POS Instance
              </DialogTitle>
              <DialogDescription className="text-(--token-gray-500) dark:text-(--token-gray-400)">
                Buat outlet baru tanpa keluar dari halaman portal.
              </DialogDescription>
            </DialogHeader>
            <POSInstanceForm
              redirectOnSuccess={false}
              onSuccess={() => setIsCreateOpen(false)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
