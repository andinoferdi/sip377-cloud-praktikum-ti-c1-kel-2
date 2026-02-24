"use client";

import {
  extractPosInstanceIdFromPath,
  withDashboardBase,
  withPosDashboardBase,
} from "@/lib/utils/dashboard-routes";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const currentPosInstanceId = extractPosInstanceIdFromPath(pathname);

  const displayName = session?.user?.name ?? "Staff";
  const displayEmail = session?.user?.email ?? "unknown@local";
  const profilePath = currentPosInstanceId
    ? withPosDashboardBase(currentPosInstanceId, "/profile")
    : withDashboardBase("/profile");

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)] dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <Image width={44} height={44} src="/images/user/owner.jpg" alt="User" />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{displayName}</span>

        <svg
          className={`stroke-[var(--token-gray-500)] dark:stroke-[var(--token-gray-400)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-[var(--token-gray-200)] bg-[var(--token-white)] p-3 shadow-theme-lg dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)]"
      >
        <div>
          <span className="block font-medium text-[var(--token-gray-700)] text-theme-sm dark:text-[var(--token-gray-400)]">
            {displayName}
          </span>
          <span className="mt-0.5 block text-theme-xs text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
            {displayEmail}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-[var(--token-gray-200)] dark:border-[var(--color-border-dark-soft)]">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href={profilePath}
              className="flex items-center gap-3 px-3 py-2 font-medium text-[var(--token-gray-700)] rounded-lg group text-theme-sm hover:bg-[var(--token-gray-100)] hover:text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)] dark:hover:bg-[var(--color-surface-dark-subtle)] dark:hover:text-[var(--token-gray-300)]"
            >
              Profile
            </DropdownItem>
          </li>
        </ul>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-[var(--token-gray-700)] rounded-lg group text-theme-sm hover:bg-[var(--token-gray-100)] hover:text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)] dark:hover:bg-[var(--color-surface-dark-subtle)] dark:hover:text-[var(--token-gray-300)]"
        >
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
