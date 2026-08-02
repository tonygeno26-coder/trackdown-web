"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Hand } from "lucide-react";
import { SavedHand, SavedHandFilters } from "@/lib/hands/types";
import {
  fetchSavedHands,
  filterSavedHands,
  uniqueFilterValues,
  uniqueTags,
} from "@/lib/hands/storage";
import SavedHandCard from "@/components/train/my-hands/SavedHandCard";
import {
  DrillScreen,
  DrillHeader,
} from "@/components/train/shared";
import {
  TextInput,
  SelectInput,
  FormField,
  EmptyState,
  LoadingState,
  ErrorState,
} from "@/components/ui";

const EMPTY_FILTERS: SavedHandFilters = {
  search: "",
  casino: "",
  game: "",
  stakes: "",
  position: "",
  dateFrom: "",
  dateTo: "",
  tag: "",
};

export default function MyHandsScreen({
  onBack,
  onReview,
}: {
  onBack: () => void;
  onReview: (hand: SavedHand) => void;
}) {
  const [hands, setHands] = useState<SavedHand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SavedHandFilters>(EMPTY_FILTERS);

  const reload = () => {
    setLoading(true);
    setError(null);
    fetchSavedHands().then(({ data, error: err }) => {
      setHands(data);
      setError(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => filterSavedHands(hands, filters), [hands, filters]);
  const casinos = uniqueFilterValues(hands, "casino");
  const games = uniqueFilterValues(hands, "game");
  const stakesList = uniqueFilterValues(hands, "stakes");
  const tags = uniqueTags(hands);

  const setFilter = <K extends keyof SavedHandFilters>(key: K, value: SavedHandFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <DrillScreen>
      <DrillHeader
        title="My Hands"
        subtitle="Saved poker hands for study and street-by-street review."
        onBack={onBack}
      />

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-td-muted" aria-hidden />
          <TextInput
            className="pl-10"
            placeholder="Search hands…"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            aria-label="Search hands"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FilterSelect label="Casino" value={filters.casino} options={casinos} onChange={(v) => setFilter("casino", v)} />
          <FilterSelect label="Game" value={filters.game} options={games} onChange={(v) => setFilter("game", v)} />
          <FilterSelect label="Stakes" value={filters.stakes} options={stakesList} onChange={(v) => setFilter("stakes", v)} />
          <FilterSelect
            label="Position"
            value={filters.position}
            options={["UTG", "MP", "CO", "BTN", "SB", "BB"]}
            onChange={(v) => setFilter("position", v)}
          />
          <FilterSelect label="Tag" value={filters.tag} options={tags} onChange={(v) => setFilter("tag", v)} />
          <FormField label="From">
            <TextInput type="date" value={filters.dateFrom} onChange={(e) => setFilter("dateFrom", e.target.value)} />
          </FormField>
        </div>
      </div>

      {loading && <LoadingState message="Loading hands…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={Hand}
          title={hands.length === 0 ? "No Saved Hands" : "No Matches"}
          description={
            hands.length === 0
              ? "Save a hand after a poker session or add one manually."
              : "No hands match your filters."
          }
        />
      )}

      <div className="space-y-3">
        {filtered.map((hand) => (
          <SavedHandCard key={hand.id} hand={hand} onClick={() => onReview(hand)} />
        ))}
      </div>
    </DrillScreen>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <FormField label={label}>
      <SelectInput value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </SelectInput>
    </FormField>
  );
}
