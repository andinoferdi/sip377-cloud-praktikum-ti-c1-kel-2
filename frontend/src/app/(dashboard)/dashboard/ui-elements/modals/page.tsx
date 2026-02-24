import PageBreadcrumb from "@/features/dashboard/components/common/PageBreadCrumb";
import DefaultModal from "@/features/dashboard/components/example/ModalExample/DefaultModal";
import FormInModal from "@/features/dashboard/components/example/ModalExample/FormInModal";
import FullScreenModal from "@/features/dashboard/components/example/ModalExample/FullScreenModal";
import ModalBasedAlerts from "@/features/dashboard/components/example/ModalExample/ModalBasedAlerts";
import VerticallyCenteredModal from "@/features/dashboard/components/example/ModalExample/VerticallyCenteredModal";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Next.js Modals | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Modals page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Modals() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Modals" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
        <DefaultModal />
        <VerticallyCenteredModal />
        <FormInModal />
        <FullScreenModal />
        <ModalBasedAlerts />
      </div>
    </div>
  );
}
