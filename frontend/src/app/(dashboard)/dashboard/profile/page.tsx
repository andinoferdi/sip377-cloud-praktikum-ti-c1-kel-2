import UserAddressCard from "@/features/dashboard/components/user-profile/UserAddressCard";
import UserInfoCard from "@/features/dashboard/components/user-profile/UserInfoCard";
import UserMetaCard from "@/features/dashboard/components/user-profile/UserMetaCard";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-2xl border border-[var(--token-gray-200)] bg-[var(--token-white)] p-5 dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)] lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </div>
  );
}
