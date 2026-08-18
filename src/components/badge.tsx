export function NumeroBadge({ numero, highlight = false }: { numero: number; highlight?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-mono font-semibold shrink-0 transition-transform hover:scale-110 ${
        highlight ? "bg-coral text-white animate-pulse-soft" : "bg-ink text-paper"
      }`}
    >
      {numero}
    </span>
  );
}
