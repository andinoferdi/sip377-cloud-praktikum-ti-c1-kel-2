import Calendar from "@/features/dashboard/components/calendar/Calendar";
import PageBreadcrumb from "@/features/dashboard/components/common/PageBreadCrumb";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Next.js Calender | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Calender page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};
export default function CalendarPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Calendar" />
      <Calendar />
    </div>
  );
}
