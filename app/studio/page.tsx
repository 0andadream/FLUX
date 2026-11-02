import { Suspense } from "react";
import { Studio } from "@/components/studio";

export default function StudioPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-[14px] text-muted">Loading the studio…</p>}>
      <Studio />
    </Suspense>
  );
}
