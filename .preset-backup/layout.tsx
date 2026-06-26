import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LendFlow — Loan Management System',
  description: 'Apply for personal loans and manage them through their entire lifecycle.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
