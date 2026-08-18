"use client";

import { useState } from "react";
import { Check, Coffee } from "lucide-react";
import { DownBlock, Shift } from "@/lib/types";
import { fmtTime } from "@/lib/blocks";
import { isTournamentStyleShift, resolveActiveSegment } from "@/lib/shift-segments";
import { DealingBottomSheet } from "@/components/dealing/DealingUi";
import {
  FormField,
  TextInput,
  CurrencyInput,
  SheetFooter,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";

export default function BlockSheet({
  shift,
  block,
  onCancel,
  onSave,
}: {
  shift: Shift;
  block: DownBlock;
  onCancel: () => void;
  onSave: (updated: DownBlock) => void;
}) {
  const activeSegment = resolveActiveSegment(shift);
  const isTournament = isTournamentStyleShift(shift, activeSegment);
  const [table, setTable] = useState(block.table);
  const [game, setGame] = useState(block.game);
  const [tips, setTips] = useState(block.tips ? String(block.tips) : "");
  const [notes, setNotes] = useState(block.notes);
  const [saving, setSaving] = useState(false);

  const tagSegment = (updated: DownBlock): DownBlock =>
    shift.type === "tournament_cash" ? { ...updated, segment: activeSegment } : updated;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    onSave(
      tagSegment({
        ...block,
        status: "done",
        table,
        game,
        tips: isTournament ? 0 : parseFloat(tips) || 0,
        notes,
      })
    );
  };

  const markSkipped = () => {
    if (saving) return;
    setSaving(true);
    onSave(tagSegment({ ...block, status: "skipped" }));
  };

  const markBreak = () => {
    if (saving) return;
    setSaving(true);
    onSave(
      tagSegment({
        ...block,
        status: "break",
        table: "",
        game: "",
        tips: 0,
        tournament: "",
        notes: "",
      })
    );
  };

  return (
    <DealingBottomSheet
      title={`${fmtTime(block.scheduledStart)} – ${fmtTime(block.scheduledEnd)}`}
      onClose={onCancel}
      footer={
        <SheetFooter>
          <SecondaryButton type="button" onClick={markSkipped} disabled={saving}>
            Skip
          </SecondaryButton>
          <PrimaryButton type="submit" form="block-sheet-form" disabled={saving}>
            <Check size={16} /> {saving ? "Saving…" : isTournament ? "Mark Logged" : "Save"}
          </PrimaryButton>
        </SheetFooter>
      }
    >
      <form id="block-sheet-form" onSubmit={submit} className="space-y-4">
        <SecondaryButton type="button" onClick={markBreak} disabled={saving} className="w-full">
          <Coffee size={16} /> Mark this down as a break
        </SecondaryButton>

        <div className="h-px bg-td-border" />

        {!isTournament && (
          <FormField label="Game">
            <TextInput
              placeholder="e.g. 1/2 NLH"
              value={game}
              onChange={(e) => setGame(e.target.value)}
            />
          </FormField>
        )}

        <FormField label="Table">
          <TextInput
            placeholder="e.g. Table 14"
            value={table}
            onChange={(e) => setTable(e.target.value)}
          />
        </FormField>

        {!isTournament && (
          <FormField label="Tips">
            <CurrencyInput value={tips} onChange={setTips} required placeholder="0" />
          </FormField>
        )}

        <FormField label="Notes">
          <TextInput
            placeholder="optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>
      </form>
    </DealingBottomSheet>
  );
}
