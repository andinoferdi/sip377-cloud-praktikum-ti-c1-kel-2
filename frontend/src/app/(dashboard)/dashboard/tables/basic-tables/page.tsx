import ComponentCard from "@/features/dashboard/components/common/ComponentCard";
import PageBreadcrumb from "@/features/dashboard/components/common/PageBreadCrumb";
import BasicTableOne from "@/features/dashboard/components/tables/BasicTableOne";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
