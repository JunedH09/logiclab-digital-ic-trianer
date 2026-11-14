import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { BookOpen, Cpu, GraduationCap, HelpCircle, LayoutDashboard, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LogicLab – Digital Electronics Virtual Laboratory',
  description: 'Interactive Digital IC Trainer Kit (DIT9006) & DECO Practical Simulator',
};

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/experiments', label: 'Guided Experiments', icon: BookOpen },
  { href: '/circuit-builder', label: 'Circuit Building', icon: Wrench },
  { href: '/examination', label: 'Examination Mode', icon: GraduationCap },
  { href: '/viva', label: 'Viva Practice', icon: HelpCircle },
  { href: '/ic-library', label: 'IC Library', icon: Cpu },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur print:hidden">
          <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-mono text-sm">LL</span>
              LogicLab
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
