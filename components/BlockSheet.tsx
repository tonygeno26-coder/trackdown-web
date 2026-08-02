"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { DownBlock, ShiftType } from "@/lib/types";
import { fmtTime } from "@/lib/blocks";

export default function BlockSheet({
  shiftType,
  block,
  onCancel,
  onSave,
}: {
  shiftType: ShiftType;
  block: DownBlock;
  onCancel: () => void;
  onSave: (updated: DownBlock) => void;
}) {
  const [tournament, setTournament] = useState(block.tournament);
  const [table, setTable] = useState(block.table);
  const [game, setGame] = useState(block.game);
  const [tips, setTips] = useState(block.tips ? String(block.tips) : "");
  const [notes, setNotes] = useState(block.notes);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...block,
      status: "done",
      tournament,
      table,
      game,
      tips: parseFloat(tips) || 0,
      notes,
    });
  };

  const markSkipped = () => onSave({ ...block, status: "skipped" });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75"
      onClick={onCancel}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-[460px] bg-td-surface border border-td-border rounded-t-2xl px-5 pt-5 pb-6 flex flex-col gap-3.5 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-display font-bold text-lg tracking-wide">
            {fmtTime(block.scheduledStart)} – {fmtTime(block.scheduledEnd)}
          </h2>
          <button type="button" onClick={onCancel} className="text-td-muted hover:text-td-cream p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {shiftType === "tournament" ? (
          <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
            <span>Tournament</span>
            <input
              className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
              placeholder="e.g. $200 Deepstack"
              value={tournament}
              onChange={(e) => setTournament(e.target.value)}
              autoFocus
            />
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
            <span>Game</span>
            <input
              className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
              placeholder="e.g. 1/2 NLH"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              autoFocus
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>Table</span>
          <input
            className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
            placeholder="e.g. Table 14"
            value={table}
            onChange={(e) => setTable(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>Tips</span>
          <div className="flex items-center bg-td-bg border border-td-border rounded-[9px] px-3">
            <span className="font-mono text-td-muted">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              required
              placeholder="0"
              className="bg-transparent border-none py-2.5 px-1 font-mono font-semibold flex-1 focus:outline-none text-td-cream"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>Notes</span>
          <input
            className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
            placeholder="optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className="flex gap-2.5 mt-1.5">
          <button
            type="button"
            onClick={markSkipped}
            className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-surface2 border border-td-border text-td-cream"
          >
            Skip
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 rounded-[10px] py-3 font-bold text-sm bg-td-gold text-[#1a1305] hover:bg-td-goldsoft"
          >
            <Check size={16} /> Save
          </button>
        </div>
      </form>
    </div>
  );
}
