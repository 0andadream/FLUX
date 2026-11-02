// Traced from the Flux lockup: an upper bar and a lower bar with a stem.
export const MARK_TOP: [number, number][] = [
  [16, 98],
  [99, 17],
  [201, 15],
  [162, 53],
  [114, 53],
  [68, 98],
];

export const MARK_BOT: [number, number][] = [
  [62, 152],
  [64, 119],
  [110, 75],
  [170, 75],
  [143, 101],
  [106, 101],
  [104, 134],
  [66, 171],
  [62, 172],
];

function points(poly: [number, number][]) {
  return poly.map(([x, y]) => `${x},${y}`).join(" ");
}

export function Mark({ className = "h-8 w-auto aspect-[202/174]" }: { className?: string }) {
  return (
    <svg viewBox="8 8 202 174" className={className} aria-hidden="true">
      <polygon points={points(MARK_TOP)} fill="currentColor" />
      <polygon points={points(MARK_BOT)} fill="currentColor" />
    </svg>
  );
}
