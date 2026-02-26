import PresenceContract from "@/features/presence/components/presence-contract";
import PresenceFlow from "@/features/presence/components/presence-flow";
import PresenceHero from "@/features/presence/components/presence-hero";
import PresenceSimulator from "@/features/presence/components/presence-simulator";

export default function PresencePage() {
  return (
    <>
      <PresenceHero />
      <PresenceFlow />
      <PresenceSimulator />
      <PresenceContract />
    </>
  );
}
