import ContractSection from "@/app/home/components/contract-section";
import FlowSection from "@/app/home/components/flow-section";
import HeroSection from "@/app/home/components/hero-section";

export default async function Home() {
  return (
    <>
      <HeroSection />
      <FlowSection />
      <ContractSection />
    </>
  );
}
