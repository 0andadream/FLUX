import Link from "next/link";
import { Mark } from "@/components/mark";

const STEPS = [
  { n: "01", title: "Ask", copy: "Write a prompt and pick image, video, music, or voice." },
  { n: "02", title: "See the price", copy: "Flux requests a live quote from buy.ai or a Celo x402 service." },
  { n: "03", title: "Sign", copy: "You approve a stablecoin authorization. The settlement lands on Celo." },
];

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16 md:py-24">
      <section className="grid items-end gap-10 md:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-xs tracking-[0.22em] text-zinc-400 uppercase">Celo · Agents on Open Rails</p>
          <h1 className="mt-4 max-w-xl text-5xl leading-[0.95] font-medium tracking-tight md:text-7xl">
            Generate on demand. Pay on Celo.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-7 text-zinc-300">
            Flux is a studio for image, video, voice, and composition. Each call is priced by the service, and you sign the stablecoin payment yourself.
          </p>
          <Link
            href="/studio"
            className="mt-8 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Start generating
          </Link>
        </div>
        <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-white/10 bg-black text-white">
          <Mark className="h-32 w-32 md:h-40 md:w-40" />
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step) => (
          <article key={step.n} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="font-mono text-xs text-[#b7adff]">{step.n}</p>
            <h2 className="mt-3 text-lg font-medium">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{step.copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
