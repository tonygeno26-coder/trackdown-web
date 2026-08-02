"use client";

import { LegacyCardRow } from "@/app/dev/card-visibility/LegacyCards";
import { parseCardList } from "@/lib/cards";

const HOLDEM_HERO = parseCardList("Ah Kh");
const HOLDEM_BOARD = parseCardList("Kc 7d 2s Jh 9c");
const PLO_HERO = parseCardList("Ah Kh Qd Jc");
const PLO_BOARD = parseCardList("Ts 9h 8d 2c 3s");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-td-border bg-td-surface p-4">
      <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wide text-td-muted">{title}</h2>
      {children}
    </section>
  );
}

/** Before-state demo for screenshot capture */
export default function CardVisibilityBeforePage() {
  return (
    <div className="mx-auto max-w-[430px] space-y-4 p-4 pb-16">
      <h1 className="font-display text-lg font-bold text-td-cream">Card Visibility — Before</h1>

      <Section title="Hold'em Preflop">
        <LegacyCardRow cards={HOLDEM_HERO} />
      </Section>

      <Section title="Hold'em River">
        <LegacyCardRow cards={HOLDEM_HERO} />
        <div className="mt-3">
          <LegacyCardRow cards={HOLDEM_BOARD} />
        </div>
      </Section>

      <Section title="PLO">
        <LegacyCardRow cards={PLO_HERO} />
        <div className="mt-3">
          <LegacyCardRow cards={PLO_BOARD} />
        </div>
      </Section>

      <Section title="Board Reading">
        <LegacyCardRow cards={PLO_BOARD.slice(0, 5)} />
      </Section>

      <Section title="My Hands Thumbnails">
        <LegacyCardRow cards={HOLDEM_HERO} />
      </Section>
    </div>
  );
}
