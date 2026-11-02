"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footer } from "./footer";
import { Mark } from "./mark";

const LINKS = [
  { href: "/studio", label: "Studio" },
  { href: "/activity", label: "Activity" },
  { href: "/agent", label: "Agent" },
  { href: "/settings", label: "Settings" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 px-4 pt-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 text-ink" aria-label="Flux home">
              <Mark className="h-7 w-auto aspect-[202/174]" />
              <span className="text-[13px] font-[560] tracking-[0.22em]">FLUX</span>
            </Link>
            <div className="sm:hidden">
              <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" label="Connect" />
            </div>
          </div>
          <nav className="glass-pill flex w-full max-w-full gap-1 overflow-x-auto p-1 sm:w-auto">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] tracking-[-0.01em] ${active ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden sm:block">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  );
}
