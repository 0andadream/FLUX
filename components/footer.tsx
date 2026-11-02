import Link from "next/link";
import { Mark } from "./mark";

type FooterLink = { href: string; label: string; external?: boolean };

const COLUMNS: { label: string; links: FooterLink[] }[] = [
  {
    label: "Product",
    links: [
      { href: "/studio", label: "Studio" },
      { href: "/activity", label: "Activity" },
      { href: "/agent", label: "Agent" },
      { href: "/settings", label: "Settings" },
    ],
  },
  {
    label: "Studio",
    links: [
      { href: "/#purchase", label: "How a purchase works" },
      { href: "/#paid", label: "What gets paid" },
      { href: "/#boundary", label: "The boundary" },
    ],
  },
  {
    label: "Project",
    links: [
      { href: "https://www.loops.house/agents-on-open-rails", label: "Agents on Open Rails", external: true },
      { href: "https://github.com/0andadream/FLUX", label: "Repository", external: true },
      { href: "https://celoscan.io", label: "Celoscan", external: true },
      { href: "https://docs.celo.org/build/agents/8004", label: "ERC-8004 on Celo", external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="px-4 pt-4 pb-14 md:pb-20">
      <div className="mx-auto w-full max-w-6xl">
        <span
          aria-hidden="true"
          className="block h-px w-full"
          style={{ background: "linear-gradient(90deg, rgba(167,180,198,0), rgba(167,180,198,0.7) 18%, rgba(167,180,198,0.7) 82%, rgba(167,180,198,0))" }}
        />
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 pt-14 sm:grid-cols-3 md:gap-x-10 md:pt-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" aria-label="Flux home" className="inline-flex items-center gap-2 text-ink">
              <Mark className="h-9 w-auto aspect-[202/174]" />
              <span className="text-[15px] font-[560] tracking-[0.22em]">FLUX</span>
            </Link>
            <p className="mt-5 max-w-sm text-[14.5px] leading-[1.6] text-muted-2">
              A studio that buys image, video, voice, and composition on Celo. The person signs every stablecoin payment. Built for Agents on Open Rails.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.label} aria-label={column.label} className={column.label === "Project" ? "col-span-2 sm:col-span-1" : ""}>
              <p className="kicker mb-5">{column.label}</p>
              <ul className="space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-[15px] tracking-[-0.01em] text-ink-soft hover:text-accent-deep">
                        {link.label}
                        <span aria-hidden="true" className="ml-1 text-muted">↗</span>
                      </a>
                    ) : (
                      <Link href={link.href} className="text-[15px] tracking-[-0.01em] text-ink-soft hover:text-accent-deep">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  );
}
