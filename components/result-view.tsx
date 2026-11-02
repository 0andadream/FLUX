import type { Presented } from "@/lib/result";

export function ResultView({ result }: { result: Presented }) {
  if (result.kind === "image") {
    return (
      <figure className="space-y-3">
        {/* User-paid output can be a data URL or a remote file. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={result.src} alt={result.caption || "Generated image"} className="max-h-[70vh] w-full rounded-[20px] border border-[rgba(120,145,180,0.2)] bg-white/60 object-contain" />
        {result.caption ? <figcaption className="text-[14px] text-muted">{result.caption}</figcaption> : null}
      </figure>
    );
  }
  if (result.kind === "audio") {
    return (
      <div className="space-y-3">
        <audio controls src={result.src} className="w-full" />
        {result.caption ? <p className="text-[14px] text-muted">{result.caption}</p> : null}
      </div>
    );
  }
  if (result.kind === "video") {
    return (
      <div className="space-y-3">
        <video controls src={result.src} className="max-h-[70vh] w-full rounded-[20px] border border-[rgba(120,145,180,0.2)] bg-ink" />
        {result.caption ? <p className="text-[14px] text-muted">{result.caption}</p> : null}
      </div>
    );
  }
  return <pre className="overflow-x-auto rounded-[20px] bg-white/50 p-4 text-[14px] leading-6 whitespace-pre-wrap text-ink">{result.text}</pre>;
}
