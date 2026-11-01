import type { Presented } from "@/lib/result";

export function ResultView({ result }: { result: Presented }) {
  if (result.kind === "image") {
    return (
      <figure className="space-y-3">
        {/* User-paid output can be a data URL or a remote file. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={result.src} alt={result.caption || "Generated image"} className="max-h-[70vh] w-full rounded-2xl border border-white/10 object-contain" />
        {result.caption ? <figcaption className="text-sm text-zinc-400">{result.caption}</figcaption> : null}
      </figure>
    );
  }
  if (result.kind === "audio") {
    return (
      <div className="space-y-3">
        <audio controls src={result.src} className="w-full" />
        {result.caption ? <p className="text-sm text-zinc-400">{result.caption}</p> : null}
      </div>
    );
  }
  if (result.kind === "video") {
    return (
      <div className="space-y-3">
        <video controls src={result.src} className="max-h-[70vh] w-full rounded-2xl border border-white/10 bg-black" />
        {result.caption ? <p className="text-sm text-zinc-400">{result.caption}</p> : null}
      </div>
    );
  }
  return <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-zinc-200">{result.text}</pre>;
}
