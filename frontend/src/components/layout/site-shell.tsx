import Footer from '@/features/marketing/components/layout/footer';
import Header from '@/features/marketing/components/layout/header/header';
import type { ReactNode } from 'react';

type SiteShellProps = {
  children: ReactNode;
};

export default function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="marketing-dark-canvas flex flex-col flex-1 [&>div]:relative [&>div]:z-10 [&>footer]:relative [&>footer]:z-10">
      <Header />
      <div className="isolate flex-1 flex flex-col">{children}</div>
      <Footer />
    </div>
  );
}
