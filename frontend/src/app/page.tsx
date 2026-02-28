import HomePage from "@/app/home/page";
import SiteShell from "@/components/layout/site-shell";

export default function RootPage() {
  return (
    <SiteShell>
      <HomePage />
    </SiteShell>
  );
}
