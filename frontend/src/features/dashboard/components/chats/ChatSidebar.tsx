"use client";

import Image from "next/image";
import ChatActionMenu from "./ChatActionMenu";
import type { ChatContact } from "./types";

type ChatSidebarProps = {
  contacts: ChatContact[];
  activeContactId: string;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSelectContact: (contactId: string) => void;
  onCloseMobileSidebar: () => void;};

const presenceClassMap = {
  online: "bg-success-500",
  away: "bg-warning-500",
  offline: "bg-error-500",
} as const;

export default function ChatSidebar({
  contacts,
  activeContactId,
  searchTerm,
  onSearchTermChange,
  onSelectContact,
  onCloseMobileSidebar,
}: ChatSidebarProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--token-gray-200)] bg-[var(--token-white)] dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)]">
      <div className="sticky px-4 pb-4 pt-4 sm:px-5 sm:pt-5 xl:pb-0">
        <div className="flex items-start justify-between">
          <h3 className="text-theme-xl font-semibold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)] sm:text-2xl">
            Chats
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCloseMobileSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--token-gray-300)] text-[var(--token-gray-700)] transition hover:bg-[var(--token-gray-100)] dark:border-[var(--color-border-dark-strong)] dark:text-[var(--token-gray-400)] dark:hover:bg-[var(--token-white-3)] xl:hidden"
              aria-label="Close contact list"
            >
              <CloseIcon />
            </button>
            <ChatActionMenu />
          </div>
        </div>

        <div className="relative my-2 w-full">
          <label htmlFor="chat-search" className="sr-only">
            Search contacts
          </label>
          <SearchIcon />
          <input
            id="chat-search"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            className="dark:bg-[var(--color-surface-dark-elevated)] h-11 w-full rounded-lg border border-[var(--token-gray-300)] bg-transparent py-2.5 pl-[42px] pr-3.5 text-sm text-[var(--token-gray-800)] shadow-theme-xs placeholder:text-[var(--token-gray-400)] focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--color-surface-dark-elevated)] dark:text-[var(--token-white-90)] dark:placeholder:text-[var(--token-white-30)] dark:focus:border-brand-800"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 sm:px-5">
        <div className="custom-scrollbar max-h-full space-y-1 overflow-auto">
          {contacts.length === 0 && (
            <p className="px-3 py-2 text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
              No chats found for "{searchTerm}".
            </p>
          )}
          {contacts.map((contact) => {
            const isActive = contact.id === activeContactId;
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => onSelectContact(contact.id)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left transition hover:bg-[var(--token-gray-100)] dark:hover:bg-[var(--token-white-3)] ${
                  isActive ? "bg-[var(--token-gray-100)] dark:bg-[var(--color-surface-dark-elevated)]" : ""
                }`}
              >
                <div className="relative h-12 w-full max-w-[48px] rounded-full">
                  <Image
                    src={contact.avatar}
                    alt={`${contact.name} profile`}
                    width={48}
                    height={48}
                    className="h-full w-full overflow-hidden rounded-full object-cover object-center"
                  />
                  <span
                    className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-[1.5px] border-[var(--token-white)] dark:border-[var(--token-gray-900)] ${
                      presenceClassMap[contact.presence]
                    }`}
                  />
                </div>

                <div className="w-full">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-sm font-medium text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
                        {contact.name}
                      </h5>
                      <p className="mt-0.5 text-theme-xs text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                        {contact.role}
                      </p>
                    </div>
                    <span className="text-theme-xs text-[var(--token-gray-400)]">
                      {contact.lastActive}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
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
    </span>
  );
}

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
        fill="currentColor"
      />
    </svg>
  );
}
