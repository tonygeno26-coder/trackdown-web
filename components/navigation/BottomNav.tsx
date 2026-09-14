"use client";

import { useEffect, useRef, useState } from "react";
import { Home, BarChart3, GraduationCap, History, Settings, Wallet } from "lucide-react";
import { motion } from "framer-motion";

export type AppTab = "home" | "stats" | "pay" | "train" | "history" | "settings";

const tabs: { key: AppTab; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "stats", label: "Stats", icon: BarChart3 },
  { key: "pay", label: "Pay", icon: Wallet },
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
  const navRef = useRef<HTMLElement>(null);
  const [topPx, setTopPx] = useState<number | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const recalc = () => {
      const nav = navRef.current;
      if (!nav) return;
      // iOS WKWebView can leave `position: fixed; bottom: 0` elements
      // anchored against a stale (pre-keyboard) viewport height after the
      // on-screen keyboard finishes showing/hiding — window.innerHeight is
      // already back to its correct value by then, but the bottom-anchored
      // fixed layout doesn't get redone until the next real scroll event
      // forces it. `visualViewport` stays accurate the whole time, so drive
      // the nav's position from it directly (as an explicit `top`, computed
      // fresh on every visualViewport change) instead of trusting the
      // browser's own bottom-anchor calculation.
      const height = nav.getBoundingClientRect().height;
      setTopPx(vv.offsetTop + vv.height - height);
    };

    recalc();
    vv.addEventListener("resize", recalc);
    vv.addEventListener("scroll", recalc);
    return () => {
      vv.removeEventListener("resize", recalc);
      vv.removeEventListener("scroll", recalc);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      style={topPx !== null ? { top: `${topPx}px`, bottom: "auto" } : undefined}
      className={`fixed inset-x-0 z-40 border-t border-td-border/70 bg-td-bg/90 backdrop-blur-lg ${
        topPx === null ? "bottom-0" : ""
      }`}
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
