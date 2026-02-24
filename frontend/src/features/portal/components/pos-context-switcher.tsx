"use client";

import { usePOSInstances } from "@/features/portal/hooks/use-pos-instances";
import { replacePosInDashboardPath } from "@/lib/utils/dashboard-routes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type POSContextSwitcherProps = {
  currentPosInstanceId: string;
};

export default function POSContextSwitcher({
  currentPosInstanceId,
}: POSContextSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: instances, isLoading } = usePOSInstances();

  const activeInstances = (instances ?? []).filter((item) => item.isActive);

  const handleChange = (nextPosId: string) => {
    if (!nextPosId || nextPosId === currentPosInstanceId) {
      return;
    }

    const nextPath = replacePosInDashboardPath(pathname, nextPosId);
    const query = searchParams.toString();
    router.push(query ? `${nextPath}?${query}` : nextPath);
  };

  if (!isLoading && activeInstances.length <= 1) {
    return null;
  }

  return (
    <label className="hidden items-center gap-2 md:flex">
      <span className="text-xs font-medium uppercase tracking-wide text-(--token-gray-500) dark:text-(--token-gray-400)">
        Outlet
      </span>
      <select
        value={currentPosInstanceId}
        onChange={(event) => handleChange(event.target.value)}
        className="h-10 min-w-44 rounded-lg border border-(--token-gray-200) bg-(--token-white) px-3 text-sm text-(--token-gray-700) focus:border-(--token-brand-400) focus:outline-none dark:border-(--token-gray-700) dark:bg-(--token-gray-800) dark:text-(--token-gray-200)"
      >
        {(activeInstances.length > 0 ? activeInstances : instances ?? []).map((instance) => (
          <option key={instance.id} value={instance.id}>
            {instance.name}
          </option>
        ))}
      </select>
    </label>
  );
}
