import GridShape from "@/features/dashboard/components/common/GridShape";
import Image from "next/image";
import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="mb-8 text-title-md font-bold text-(--token-gray-800) dark:text-(--token-white-90) xl:text-title-2xl">
          ERROR
        </h1>

        <Image
          src="/images/error/404.svg"
          alt="404"
          className="dark:hidden"
          width={472}
          height={152}
        />
        <Image
          src="/images/error/404-dark.svg"
          alt="404"
          className="hidden dark:block"
          width={472}
          height={152}
        />

        <p className="mb-6 mt-10 text-base text-(--token-gray-700) dark:text-(--token-gray-400) sm:text-lg">
          We can&apos;t seem to find the page you are looking for.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-(--token-gray-300) bg-(--token-white) px-5 py-3.5 text-sm font-medium text-(--token-gray-700) shadow-theme-xs hover:bg-(--token-gray-50) hover:text-(--token-gray-800) dark:border-(--token-gray-700) dark:bg-(--token-gray-800) dark:text-(--token-gray-400) dark:hover:bg-(--token-white-3) dark:hover:text-(--token-gray-200)"
        >
          Back to Dashboard
        </Link>
      </div>

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
        &copy; {new Date().getFullYear()} - TailAdmin
      </p>
    </div>
  );
}
