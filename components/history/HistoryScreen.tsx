"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Shift, DownBlock, PlayingSession } from "@/lib/types";
import { replaceShiftBlock } from "@/lib/db-mutations";
import DealingHistory from "@/components/history/DealingHistory";
import GamingHistory from "@/components/history/GamingHistory";
import BlockSheet from "@/components/BlockSheet";
import TrackdownHeader from "@/components/TrackdownHeader";
import { SegmentedControl } from "@/components/ui";

type HistoryTab = "dealing" | "gaming";

export default function HistoryScreen({
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
    const { blocks: nextBlocks, error: err } = await replaceShiftBlock(shift.id, updatedBlock);
    if (err || !nextBlocks) {
      setError(err ?? "Could not save down.");
      return;
    }
    onShiftsChange(shifts.map((s) => (s.id === shift.id ? { ...s, blocks: nextBlocks } : s)));
    setBlockSheet(null);
  };

  return (
    <div className="pb-4">
      <TrackdownHeader compact />

      <div className="mb-5 mt-2">
        <SegmentedControl
          options={[
            { key: "dealing" as HistoryTab, label: "Dealing" },
            { key: "gaming" as HistoryTab, label: "Gaming" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "dealing" ? (
        <DealingHistory
          shifts={pastShifts}
          onBlockTap={(shift, block) => setBlockSheet({ shift, block })}
          onDeleteShift={deleteShift}
        />
      ) : (
        <GamingHistory sessions={playingSessions} onDelete={deleteSession} />
      )}

      {blockSheet && (
        <BlockSheet
          shift={blockSheet.shift}
          block={blockSheet.block}
          onCancel={() => setBlockSheet(null)}
          onSave={saveBlock}
        />
      )}
    </div>
  );
}
