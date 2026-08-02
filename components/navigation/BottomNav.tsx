"use client";

import { Home, BarChart3, GraduationCap, History, Settings } from "lucide-react";
import { motion } from "framer-motion";

export type AppTab = "home" | "stats" | "train" | "history" | "settings";

const tabs: { key: AppTab; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "stats", label: "Stats", icon: BarChart3 },
  { key: "train", label: "Train", icon: GraduationCap },
  { key: "history", label: "History", icon: History },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-td-border/70 bg-td-bg/90 backdrop-blur-lg"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-[520px] items-stretch px-0.5 pb-[env(safe-area-inset-bottom)] pt-0.5">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 ${
                isActive ? "text-td-gold" : "text-td-muted hover:text-td-cream"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-td-gold"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.3px]">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
