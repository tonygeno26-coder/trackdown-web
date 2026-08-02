"use client";

export default function PokerSeat({
  position,
  stack,
  isHero,
  isDealer,
  isActive,
  folded,
}: {
  position: string;
  stack: string;
  isHero?: boolean;
  isDealer?: boolean;
  isActive?: boolean;
  folded?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col items-center gap-0.5 rounded-xl border px-3 py-2 ${
        isHero
          ? "border-td-gold/40 bg-td-gold/5"
          : isActive
            ? "border-td-goldsoft/30 bg-td-surface2/80"
            : "border-td-border/60 bg-td-surface2/40"
      } ${folded ? "opacity-40" : ""}`}
    >
      {isDealer && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-td-gold/50 bg-td-gold text-[9px] font-bold text-td-cream">
          D
        </span>
      )}
      <span className={`text-[11px] font-bold uppercase tracking-wide ${isHero ? "text-td-goldsoft" : "text-td-cream"}`}>
        {position}
        {isHero && " (You)"}
      </span>
      <span className="font-mono text-[11px] text-td-muted">{stack}</span>
    </div>
  );
}
