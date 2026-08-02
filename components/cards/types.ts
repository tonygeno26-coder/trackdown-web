export type CardSize = "thumbnail" | "small" | "medium" | "large" | "hero";

export type CardVariant = "poker" | "blackjack" | "thumbnail" | "picker";

export type CardState =
  | "default"
  | "selected"
  | "highlighted"
  | "dimmed"
  | "winning"
  | "losing"
  | "used"
  | "face-down"
  | "disabled";

/** Width × height classes per size (~390px baseline, scales down at 320px) */
export const CARD_SIZE_CLASS: Record<CardSize, string> = {
  thumbnail:
    "h-[2.625rem] w-[1.875rem] max-[360px]:h-[2.375rem] max-[360px]:w-[1.75rem] text-[9px]",
  small:
    "h-[3.375rem] w-[2.375rem] max-[360px]:h-[3.125rem] max-[360px]:w-[2.125rem] text-[10px]",
  medium:
    "h-[4.375rem] w-[3.125rem] max-[360px]:h-[4rem] max-[360px]:w-[2.875rem] text-[11px]",
  large:
    "h-[5.125rem] w-[3.625rem] max-[360px]:h-[4.75rem] max-[360px]:w-[3.375rem] text-[12px]",
  hero:
    "h-[5.875rem] w-[4.125rem] max-[360px]:h-[5.375rem] max-[360px]:w-[3.75rem] text-[13px]",
};

export const CARD_CENTER_SUIT: Record<CardSize, string> = {
  thumbnail: "text-[0.85rem]",
  small: "text-[1.1rem]",
  medium: "text-[1.45rem]",
  large: "text-[1.75rem]",
  hero: "text-[2rem]",
};

export const CARD_RANK_CLASS: Record<CardSize, string> = {
  thumbnail: "text-[0.95em] font-extrabold",
  small: "text-[1em] font-extrabold",
  medium: "text-[1.05em] font-extrabold",
  large: "text-[1.1em] font-extrabold",
  hero: "text-[1.15em] font-extrabold",
};

/** Blackjack cards are wider than poker hero */
export const BLACKJACK_SIZE_CLASS =
  "h-[6.5rem] w-[4.75rem] max-[360px]:h-[6rem] max-[360px]:w-[4.375rem] text-[15px]";

/** PLO fan cards — compact but readable */
export const PLO_FAN_SIZE_CLASS =
  "h-[5rem] w-[3.375rem] max-[360px]:h-[4.625rem] max-[360px]:w-[3.125rem] text-[11px]";

/** Card picker touch targets */
export const PICKER_SIZE_CLASS =
  "h-[4.75rem] w-[3.375rem] max-[360px]:h-[4.375rem] max-[360px]:w-[3.125rem] text-[11px]";

export function cardStateClasses(state: CardState): string {
  switch (state) {
    case "selected":
      return "border-td-gold ring-2 ring-td-gold/50 -translate-y-1 shadow-td-glow-sm z-10";
    case "highlighted":
      return "border-td-gold ring-2 ring-td-gold/40 z-[1]";
    case "dimmed":
      return "opacity-45";
    case "winning":
      return "border-td-goldsoft ring-2 ring-td-goldsoft/40 z-[1]";
    case "losing":
      return "opacity-50 border-td-border";
    case "used":
      return "opacity-35 saturate-50";
    case "disabled":
      return "opacity-30 pointer-events-none";
    case "face-down":
      return "";
    default:
      return "border-td-border/90";
  }
}
