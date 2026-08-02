"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export function ChoiceButton({
  selected,
  onClick,
  disabled,
  icon: Icon,
  children,
  className = "",
}: {
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-[52px] flex-col items-center justify-center gap-2 rounded-td border px-3 py-4 text-[12.5px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 disabled:cursor-not-allowed disabled:opacity-35 ${
        selected
          ? "border-td-gold bg-td-gold/10 text-td-goldsoft"
          : "border-td-border/90 bg-td-surface2/70 text-td-cream hover:border-td-gold/40"
      } ${className}`}
    >
      {Icon && <Icon size={20} strokeWidth={1.75} className={selected ? "text-td-gold" : "text-td-gold"} />}
      {children}
    </button>
  );
}

export function ChoiceGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>;
}
