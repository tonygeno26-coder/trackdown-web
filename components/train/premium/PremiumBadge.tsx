"use client";

import { Sparkles } from "lucide-react";

export default function PremiumBadge({ label = "Premium" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-td-gold/40 bg-td-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.8px] text-td-goldsoft">
      <Sparkles size={10} />
      {label}
    </span>
  );
}
