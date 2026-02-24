import type { Metadata } from "next";
import { EcommerceMetrics } from "@/features/dashboard/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/features/dashboard/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/features/dashboard/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/features/dashboard/components/ecommerce/StatisticsChart";
import RecentOrders from "@/features/dashboard/components/ecommerce/RecentOrders";
import DemographicCard from "@/features/dashboard/components/ecommerce/DemographicCard";
import HealthStatusCard from "@/features/dashboard/components/ecommerce/HealthStatusCard";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <HealthStatusCard />
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
  );
}
