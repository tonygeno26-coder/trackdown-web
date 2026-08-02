"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Shift, DownBlock, PlayingSession } from "@/lib/types";
import HistoryList from "@/components/HistoryList";
import PlayingHistory from "@/components/playing/PlayingHistory";
import BlockSheet from "@/components/BlockSheet";

type HistoryTab = "dealing" | "playing";

export default function HistorySection({
  shifts,
  playingSessions,
  onShiftsChange,
  onSessionsChange,
  setError,
}: {
  shifts: Shift[];
  playingSessions: PlayingSession[];
  onShiftsChange: (next: Shift[]) => void;
  onSessionsChange: (next: PlayingSession[]) => void;
  setError: (msg: string | null) => void;
}) {
  const [tab, setTab] = useState<HistoryTab>("dealing");
  const [blockSheet, setBlockSheet] = useState<{ shift: Shift; block: DownBlock } | null>(null);

  const pastShifts = shifts.filter((s) => s.status !== "active");

  const deleteShift = async (id: string) => {
    const { error: err } = await supabase.from("shifts").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return;
    }
    onShiftsChange(shifts.filter((s) => s.id !== id));
  };

  const deleteSession = async (id: string) => {
    const { error: err } = await supabase.from("playing_sessions").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return;
    }
    onSessionsChange(playingSessions.filter((s) => s.id !== id));
  };

  const saveBlock = async (updatedBlock: DownBlock) => {
    if (!blockSheet) return;
    const shift = blockSheet.shift;
    const nextBlocks = shift.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
    const { error: err } = await supabase.from("shifts").update({ blocks: nextBlocks }).eq("id", shift.id);
    if (err) {
      setError(err.message);
      return;
    }
    onShiftsChange(shifts.map((s) => (s.id === shift.id ? { ...s, blocks: nextBlocks } : s)));
    setBlockSheet(null);
  };

  return (
    <>
      <div className="flex gap-1.5 mb-4">
        {(["dealing", "playing"] as HistoryTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-full border capitalize ${
              tab === t
                ? "bg-td-gold border-td-gold text-[#1a1305]"
                : "bg-transparent border-td-border text-td-muted hover:border-td-gold"
            }`}
          >
            {t === "dealing" ? "Dealing" : "Playing"}
          </button>
        ))}
      </div>

      {tab === "dealing" ? (
        <HistoryList
          shifts={pastShifts}
          onBlockTap={(shift, block) => setBlockSheet({ shift, block })}
          onDeleteShift={deleteShift}
        />
      ) : (
        <PlayingHistory sessions={playingSessions} onDelete={deleteSession} />
      )}

      {blockSheet && (
        <BlockSheet
          shiftType={blockSheet.shift.type}
          block={blockSheet.block}
          onCancel={() => setBlockSheet(null)}
          onSave={saveBlock}
        />
      )}
    </>
  );
}
