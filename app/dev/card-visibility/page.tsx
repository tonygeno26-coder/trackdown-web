"use client";

import PlayingCard from "@/components/cards/PlayingCard";
import CardRow from "@/components/cards/CardRow";
import CardFan from "@/components/cards/CardFan";
import CardPicker from "@/components/cards/CardPicker";
import CardBack from "@/components/cards/CardBack";
import CardPlaceholder from "@/components/cards/CardPlaceholder";
import { parseCardList } from "@/lib/cards";

const HOLDEM_HERO = parseCardList("Ah Kh");
const HOLDEM_BOARD = parseCardList("Kc 7d 2s Jh 9c");
const PLO_HERO = parseCardList("Ah Kh Qd Jc");
const PLO_BOARD = parseCardList("Ts 9h 8d 2c 3s");
const BJ_HARD = parseCardList("10s 6h");
const BJ_PAIR = parseCardList("8d 8h");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-td-border bg-td-surface p-4">
      <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wide text-td-muted">{title}</h2>
      {children}
    </section>
  );
}

export default function CardVisibilityDemoPage() {
  return (
    <div className="mx-auto max-w-[430px] space-y-4 p-4 pb-16">
      <h1 className="font-display text-lg font-bold text-td-cream">Card Visibility Demo</h1>

      <Section title="Hold'em Preflop">
        <CardRow cards={HOLDEM_HERO} size="hero" highlighted overlap />
      </Section>

      <Section title="Hold'em River">
        <CardRow cards={HOLDEM_HERO} size="hero" highlighted overlap />
        <div className="mt-3">
          <CardRow cards={HOLDEM_BOARD} size="medium" overlap />
        </div>
      </Section>

      <Section title="PLO">
        <CardFan cards={PLO_HERO} highlighted />
        <div className="mt-3">
          <CardRow cards={PLO_BOARD} size="medium" overlap />
        </div>
      </Section>

      <Section title="Blackjack Hard Total">
        <div className="flex justify-center gap-0">
          <PlayingCard rankOnly="10" variant="blackjack" size="hero" />
          <PlayingCard rankOnly="6" variant="blackjack" size="hero" style={{ marginLeft: "-18px", zIndex: 2 }} />
        </div>
        <p className="mt-2 text-center font-mono text-[22px] font-bold text-td-goldsoft">16</p>
      </Section>

      <Section title="Blackjack Pair">
        <CardRow cards={BJ_PAIR} size="hero" overlap />
      </Section>

      <Section title="Board Reading">
        <CardRow cards={PLO_BOARD.slice(0, 5)} size="medium" overlap />
        <div className="mt-3 space-y-2">
          <CardRow cards={parseCardList("As Kd")} size="small" overlap />
          <CardRow cards={parseCardList("Qh Jh")} size="small" overlap />
        </div>
      </Section>

      <Section title="Hi-Lo Board">
        <CardRow cards={parseCardList("Ah 2h 3d 4c 5s")} size="medium" overlap />
      </Section>

      <Section title="My Hands Thumbnails">
        <CardRow cards={HOLDEM_HERO} size="thumbnail" overlap />
        <CardRow cards={HOLDEM_BOARD.slice(0, 3)} size="thumbnail" overlap />
      </Section>

      <Section title="Card Picker">
        <CardPicker value="Ah Kh" onChange={() => {}} maxCards={2} />
      </Section>

      <Section title="States">
        <div className="flex flex-wrap justify-center gap-2">
          <PlayingCard card={HOLDEM_HERO[0]} size="medium" />
          <PlayingCard card={HOLDEM_HERO[0]} size="medium" selected />
          <PlayingCard card={HOLDEM_HERO[0]} size="medium" highlighted />
          <PlayingCard card={HOLDEM_HERO[0]} size="medium" dimmed />
          <CardBack size="medium" />
          <CardPlaceholder size="medium" />
        </div>
      </Section>
    </div>
  );
}
