"use client";

import type { HistorySession } from "./data";

type AiTextGeneratorHistorySidebarProps = {
  sessions: HistorySession[];
  activeSessionId: string | null;
  searchTerm: string;
  showAllHistory: boolean;
  onSearchTermChange: (value: string) => void;
  onNewChat: () => void;
  onSelectSession: (session: HistorySession) => void;
  onToggleShowMore: () => void;};

export default function AiTextGeneratorHistorySidebar({
  sessions,
  activeSessionId,
  searchTerm,
  showAllHistory,
  onSearchTermChange,
  onNewChat,
  onSelectSession,
  onToggleShowMore,
}: AiTextGeneratorHistorySidebarProps) {
  const todaySessions = sessions.filter((session) => session.group === "Today");
  const yesterdaySessions = sessions.filter(
    (session) => session.group === "Yesterday"
  );

  const visibleYesterdaySessions =
    showAllHistory || searchTerm.trim()
      ? yesterdaySessions
      : yesterdaySessions.slice(0, 4);

  return (
    <aside className="flex h-full w-[280px] flex-col border-l border-[var(--token-gray-200)] bg-[var(--token-white)] p-6 dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)]">
      <button
        type="button"
        onClick={onNewChat}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-[var(--token-white)] transition hover:bg-brand-600"
      >
        <PlusIcon />
        New Chat
      </button>

      <div className="mt-5">
        <label htmlFor="ai-chat-search" className="sr-only">
          Search history
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            id="ai-chat-search"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            className="dark:bg-[var(--color-surface-dark-elevated)] shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-[var(--token-gray-300)] bg-transparent py-2.5 pl-[42px] pr-3.5 text-sm text-[var(--token-gray-800)] placeholder:text-[var(--token-gray-400)] focus:outline-hidden focus:ring-3 dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--color-surface-dark-elevated)] dark:text-[var(--token-white-90)] dark:placeholder:text-[var(--token-white-30)]"
          />
        </div>
      </div>

      <div className="custom-scrollbar mt-6 h-full flex-1 space-y-3 overflow-y-auto text-sm">
        <HistoryGroup
          title="Today"
          sessions={todaySessions}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
        />

        <div className="relative">
          <HistoryGroup
            title="Yesterday"
            sessions={visibleYesterdaySessions}
            activeSessionId={activeSessionId}
            onSelectSession={onSelectSession}
          />
          <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-8 w-full bg-gradient-to-t from-[var(--token-white)] to-transparent dark:from-[var(--token-gray-900)]" />
        </div>
      </div>

      {yesterdaySessions.length > 4 && (
        <div className="mt-4 pl-3">
          <button
            type="button"
            onClick={onToggleShowMore}
            className="flex w-full items-center justify-between text-xs font-medium text-[var(--token-gray-400)]"
          >
            <span>{showAllHistory ? "Show less..." : "Show more..."}</span>
            <ChevronIcon className={showAllHistory ? "rotate-180" : ""} />
          </button>
        </div>
      )}
    </aside>
  );
}

type HistoryGroupProps = {
  title: string;
  sessions: HistorySession[];
  activeSessionId: string | null;
  onSelectSession: (session: HistorySession) => void;};

function HistoryGroup({
  title,
  sessions,
  activeSessionId,
  onSelectSession,
}: HistoryGroupProps) {
  if (!sessions.length) return null;

  return (
    <div>
      <p className="mb-3 pl-3 text-xs uppercase text-[var(--token-gray-400)]">{title}</p>
      <ul className="space-y-1">
        {sessions.map((session) => {
          const isActive = activeSessionId === session.id;
          return (
            <li
              key={session.id}
              className={`group relative rounded-full px-3 py-1.5 transition hover:bg-[var(--token-gray-50)] dark:hover:bg-[var(--token-gray-950)] ${
                isActive ? "bg-[var(--token-gray-100)] dark:bg-[var(--token-gray-950)]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectSession(session)}
                  className="block truncate text-left text-sm text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)]"
                >
                  {session.title}
                </button>
                <button
                  type="button"
                  className="invisible ml-2 rounded-full p-1 text-[var(--token-gray-700)] hover:bg-[var(--token-gray-200)] group-hover:visible dark:bg-[var(--color-surface-dark-subtle)] dark:text-[var(--token-gray-400)]"
                  aria-label="History options"
                >
                  <MoreDotsIcon />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 10.0002H15.0006M10.0002 5V15.0006"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="fill-[var(--token-gray-500)] dark:fill-[var(--token-gray-400)]"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z"
      />
    </svg>
  );
}

function MoreDotsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 9.00384V8.99634M13.5 9.00384V8.99634M9 9.00384V8.99634"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`ml-2 transition-transform ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.83331 6.41669L7.99998 10.5834L12.1666 6.41669"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
