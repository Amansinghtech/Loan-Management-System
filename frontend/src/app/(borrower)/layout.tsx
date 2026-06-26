import { BorrowerSidebar } from '@/components/borrower/borrower-sidebar';
import { Topbar } from '@/components/topbar';

export default function BorrowerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Topbar homeHref="/portal" />
      <div className="container flex flex-col gap-6 py-6 md:flex-row">
        <BorrowerSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
