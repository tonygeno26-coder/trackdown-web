"use client";

export type MainView = "dealing" | "playing" | "history";

export default function AppHeader({
  view,
  onViewChange,
}: {
  view: MainView;
  onViewChange: (view: MainView) => void;
}) {
  const tabs: { key: MainView; label: string }[] = [
    { key: "dealing", label: "Dealing" },
    { key: "playing", label: "Playing" },
    { key: "history", label: "History" },
  ];

  return (
    <>
      <header className="pt-9 pb-1 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="w-7 h-7 rounded-full bg-td-gold flex items-center justify-center text-td-cream text-sm">
            ♠
          </span>
          <h1 className="font-display font-extrabold text-[24px] tracking-[3px] uppercase bg-gradient-to-b from-white to-td-muted bg-clip-text text-transparent">
            Trackdown
          </h1>
        </div>
        <p className="text-[10.5px] text-td-muted tracking-[1.5px] uppercase mt-1">
          Track every down. Own the night.
        </p>
      </header>

      <nav className="max-w-[520px] mx-auto mt-4 bg-td-surface rounded-[10px] p-1 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onViewChange(tab.key)}
            className={`flex-1 rounded-lg py-2 text-[12.5px] font-semibold ${
              view === tab.key ? "bg-td-gold text-[#1a1305]" : "text-td-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}
