export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path fill="currentColor" d="M8 4h48l-6 12H22v8h26l-6 12H22v24H8V4z" />
    </svg>
  );
}
