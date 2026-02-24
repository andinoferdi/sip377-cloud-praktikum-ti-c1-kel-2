import { getCurrentYear } from '@/lib/utils';

export default function SidebarWidget() {
  return (
    <div>

      <div className="pt-5 pb-3 px-3 rounded-2xl widget-bg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
              John Doe
            </p>
            <p className="text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
              john.doe@example.com
            </p>
          </div>

          <span className="bg-[var(--token-white)] dark:bg-[var(--token-white-10)] text-[var(--color-gray-700)] dark:text-[var(--token-white-70)] px-2 py-0.5 text-xs font-medium rounded-full">
            Free
          </span>
        </div>
        <div className="mt-5">
          <button className="rounded-full gradient-btn text-[var(--token-white)] flex gap-2 items-center justify-center text-xs font-semibold w-full px-6 py-3">
            Upgrade Plan
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M9.61054 2.0625L3.58887 10.5264H8.38943L8.38943 15.9375L14.4111 7.47361L9.61054 7.47361V2.0625Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-3 px-3 text-center tracking-wide text-xs text-[var(--token-gray-400)]">
        &copy; {getCurrentYear()} All Right Reserved
      </div>
    </div>
  );
}
