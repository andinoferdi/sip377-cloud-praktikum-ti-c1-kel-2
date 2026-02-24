import { useSidebar } from "@/app/(dashboard)/dashboard/_hooks/use-sidebar";
import React from "react";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-[var(--token-gray-900-50)] lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
