import { InkLink, Kicker } from "@/components/frame";
import { Mark } from "@/components/mark";

const STEPS = [
  {
    n: "01",
    title: "Ask",
    copy: "Write a prompt and pick image, video, music, or voice. The studio builds the request. The browser does not name the URL.",
  },
  {
    n: "02",
    title: "See the price",
    copy: "Flux sends an unpaid request. A live 402 comes back, and only the exact Celo offers are shown. Asking for a price spends nothing.",
  },
  {
    n: "03",
    title: "Sign",
    copy: "You approve one stablecoin authorization. The settlement lands on Celo, and Activity keeps the transaction hash.",
  },
];

const RAILS = [
  ["Image, video, voice", "agent402", "USDC on Celo", "Quoted"],
  ["Score", "buy.ai Cencori", "USDC, USD₮, USA₮", "Quoted"],
  ["Vocal after a score", "agent402 speech", "USDC, a second signature", "Quoted"],
  ["Agent identity", "ERC-8004 registry", "Your wallet pays the gas", "When you register"],
];

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 pb-20">
      <section className="grid items-end gap-10 py-16 md:grid-cols-[1.25fr_0.75fr] md:py-24">
        <div>
          <Kicker>Celo · Agents on Open Rails</Kicker>
          <h1 className="mt-5 max-w-[11em] text-[clamp(3.1rem,1.4rem+5vw,6.2rem)] leading-[0.92] font-[340] tracking-[-0.035em] text-ink">
            Pay for the generation.
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-7 tracking-[-0.015em] text-muted">
            Flux is a studio for image, video, voice, and composition. The service names the price. You sign the stablecoin payment yourself.
          </p>
          <div className="mt-8">
            <InkLink href="/studio">Open studio</InkLink>
          </div>
        </div>
        <aside className="glass relative rounded-[28px] p-6 text-ink md:p-7">
          <p className="kicker">Unpaid quote · voice</p>
          <p className="num mt-6 text-[4.5rem] leading-none text-ink">$0.006</p>
          <p className="mt-3 text-[15px] tracking-[-0.015em] text-muted-2">USDC · eip155:42220 · EIP-3009</p>
          <dl className="mt-6 space-y-3 border-t border-[rgba(120,145,180,0.2)] pt-5 text-[14px]">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="shrink-0 text-muted">Payee</dt>
              <dd className="min-w-0 truncate font-mono text-[12px] text-ink">0xaBF4…a9D0</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="shrink-0 text-muted">Service</dt>
              <dd className="min-w-0 text-right text-ink">agent402 speech</dd>
            </div>
          </dl>
          <p className="mt-5 text-[13px] leading-5 text-muted">Seen on the public app. Nothing in that quote was settled.</p>
          <Mark className="absolute top-6 right-6 h-8 w-8 text-ink/80" />
        </aside>
      </section>

      <section className="grid gap-6 border-t border-[rgba(120,145,180,0.2)] py-16 sm:grid-cols-3">
        {[
          ["$0.03", "Image", "USDC, one still"],
          ["$0.20", "Video", "USDC, about four seconds"],
          ["$0.01", "Score", "USDC, USD₮, or USA₮"],
        ].map(([amount, label, note]) => (
          <div key={label}>
            <p className="num text-[3.4rem] leading-none text-ink">{amount}</p>
            <p className="mt-3 text-[15px] font-[520] tracking-[-0.02em] text-ink">{label}</p>
            <p className="mt-1 text-[14px] text-muted">{note}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-[rgba(120,145,180,0.2)] py-16 md:py-24">
        <Kicker index="01">The purchase</Kicker>
        <h2 className="mt-5 max-w-[16em] text-balance text-[clamp(2.05rem,1.2rem+2.4vw,3.4rem)] leading-[1.05] font-[340] tracking-[-0.035em]">
          One prompt. A price on screen. Then a signature.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.n} className="glass flex flex-col rounded-[24px] p-6 md:rounded-[28px]">
              <p className="font-mono text-[13px] text-accent-deep">{step.n}</p>
              <h3 className="mt-5 text-[24px] font-[420] tracking-[-0.03em]">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-6 text-muted">{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[rgba(120,145,180,0.2)] py-16 md:py-24">
        <Kicker index="02">What gets paid</Kicker>
        <h2 className="mt-5 max-w-[16em] text-balance text-[clamp(2.05rem,1.2rem+2.4vw,3.4rem)] leading-[1.05] font-[340] tracking-[-0.035em]">
          The seller names the asset. Flux does not invent one.
        </h2>
        <div className="glass mt-10 overflow-x-auto rounded-[24px] md:rounded-[28px]">
          <table className="w-full text-left text-[14px]">
            <thead className="kicker">
              <tr className="border-b border-[rgba(120,145,180,0.16)]">
                <th className="px-5 py-4 font-medium">Work</th>
                <th className="px-5 py-4 font-medium">Seller</th>
                <th className="hidden px-5 py-4 font-medium sm:table-cell">Asset</th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {RAILS.map((row) => (
                <tr key={row[0]} className="border-b border-[rgba(120,145,180,0.12)] last:border-0">
                  <td className="px-5 py-4 text-ink">{row[0]}</td>
                  <td className="px-5 py-4 text-muted-2">{row[1]}</td>
                  <td className="hidden px-5 py-4 text-muted-2 sm:table-cell">{row[2]}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full border border-[#0E8A5F]/30 bg-[#0E8A5F]/[0.07] px-2.5 py-1 text-[11px] font-[560] tracking-[0.08em] text-[#0A6B4A] uppercase">
                      {row[3]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-2xl text-[15px] leading-7 text-muted">
          Music is two purchases. The score can settle in USDC, USD₮, or USA₮. The spoken line is a second signature, and the voice quotes seen so far list USDC. Local stables appear only when a live 402 names them.
        </p>
      </section>

      <section className="border-t border-[rgba(120,145,180,0.2)] py-16 md:flex md:items-end md:justify-between md:gap-10">
        <div>
          <Kicker index="03">The boundary</Kicker>
          <h2 className="mt-5 max-w-[14em] text-balance text-[clamp(2.05rem,1.2rem+2.4vw,3.4rem)] leading-[1.05] font-[340] tracking-[-0.035em]">
            The person signs. The model never does.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">
            The server holds no key. A row appears in Activity only after a settlement returns a transaction hash.
          </p>
        </div>
        <div className="mt-8 shrink-0">
          <InkLink href="/studio">Open studio</InkLink>
        </div>
      </section>
    </div>
  );
}
