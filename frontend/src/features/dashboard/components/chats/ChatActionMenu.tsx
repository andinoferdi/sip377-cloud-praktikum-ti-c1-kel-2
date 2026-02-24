"use client";

import { useState } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

type ChatActionMenuProps = {
  align?: "left" | "right";
  items?: string[];};

const defaultItems = ["View Profile", "Mute Chat", "Delete Chat"];

export default function ChatActionMenu({
  align = "right",
  items = defaultItems,
}: ChatActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex">
      <button onClick={toggleDropdown} className="dropdown-toggle">
        <MoreDotIcon className="text-[var(--token-gray-400)] hover:text-[var(--token-gray-700)] dark:hover:text-[var(--token-gray-300)]" />
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className={`w-40 p-2 ${align === "left" ? "left-0 right-auto" : ""}`}
      >
        {items.map((item) => (
          <DropdownItem
            key={item}
            onItemClick={closeDropdown}
            className="flex w-full rounded-lg text-left font-normal text-[var(--token-gray-500)] hover:bg-[var(--token-gray-100)] hover:text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)] dark:hover:bg-[var(--color-surface-dark-subtle)] dark:hover:text-[var(--token-gray-300)]"
          >
            {item}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}
