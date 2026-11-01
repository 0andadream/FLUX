"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070708]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Mark className="h-7 w-7" />
            <span className="text-sm font-medium tracking-[0.18em]">FLUX</span>
          </Link>
          <nav className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-sm ${active ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
