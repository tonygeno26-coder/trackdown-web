"use client";

import { Home, BarChart3, History, Settings } from "lucide-react";

export type AppTab = "home" | "stats" | "history" | "settings";

const tabs: { key: AppTab; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "stats", label: "Stats", icon: BarChart3 },
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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-td-border/80 bg-td-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[520px] items-stretch px-2 pb-[env(safe-area-inset-bottom)] pt-1">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                isActive ? "text-td-gold" : "text-td-muted hover:text-td-cream"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.5px]">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
