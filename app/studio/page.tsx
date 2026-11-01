import { Suspense } from "react";
import { Studio } from "@/components/studio";

export default function StudioPage() {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-sm text-zinc-400">Loading the studio…</p>}>
      <Studio />
    </Suspense>
  );
}
