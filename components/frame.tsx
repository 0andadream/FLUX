import Link from "next/link";

export function Kicker({ index, children }: { index?: string; children: React.ReactNode }) {
  return (
    <p className="kicker flex items-center gap-3">
      {index ? (
        <span className="glass-pill inline-flex h-8 min-w-11 items-center justify-center px-2.5 font-mono text-[12px] font-normal tracking-normal text-ink normal-case">
          {index}
        </span>
      ) : null}
      {children}
    </p>
  );
}

export function Knob() {
  return (
    <span className="knob" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 7h8M7.5 3.5 11 7 7.5 10.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function InkLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn-ink">
      <span>{children}</span>
      <Knob />
    </Link>
  );
}
