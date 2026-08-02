"use client";

import { ChevronRight, User, DollarSign, MapPin, Palette, Download, Info } from "lucide-react";
import TrackdownHeader from "@/components/TrackdownHeader";
import { PlayingCard } from "@/components/playing/PlayingUi";

const sections = [
  { icon: User, label: "Profile", description: "Name and dealer preferences" },
  { icon: DollarSign, label: "Default Tournament Hourly Rate", description: "Pre-fill tournament rate on new shifts" },
  { icon: MapPin, label: "Default Casino / Location", description: "Save your usual venues" },
  { icon: Palette, label: "Appearance", description: "Theme and display options" },
  { icon: Download, label: "Export Data", description: "Download shifts and sessions" },
  { icon: Info, label: "About Trackdown", description: "Version and support" },
];

export default function SettingsScreen() {
  return (
    <div className="space-y-5 pb-4">
      <TrackdownHeader />

      <p className="text-[14px] text-td-muted">Preferences and account settings coming soon.</p>

      <div className="space-y-2">
        {sections.map(({ icon: Icon, label, description }) => (
          <button
            key={label}
            type="button"
            disabled
            className="flex w-full items-center gap-4 rounded-td-lg border border-td-border/80 bg-td-surface/80 px-4 py-4 text-left opacity-60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-td-surface2 text-td-muted">
              <Icon size={18} strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-td-cream">{label}</span>
              <span className="mt-0.5 block text-[12px] text-td-muted">{description}</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-td-muted" />
          </button>
        ))}
      </div>

      <PlayingCard className="px-4 py-4 text-center">
        <p className="text-[12px] text-td-muted">Trackdown · Track every down. Own the night.</p>
      </PlayingCard>
    </div>
  );
}
