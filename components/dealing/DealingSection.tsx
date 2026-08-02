"use client";

import { useState } from "react";
import { Plus, Spade } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Shift, DownBlock, ShiftType } from "@/lib/types";
import { buildBlocks, extendBlocks } from "@/lib/blocks";
import ShiftPanel from "@/components/ShiftPanel";
import NewShiftModal from "@/components/NewShiftModal";
import BlockSheet from "@/components/BlockSheet";
import EndShiftModal from "@/components/EndShiftModal";
import LumpSumModal from "@/components/LumpSumModal";

export default function DealingSection({
  shifts,
  onShiftsChange,
  setError,
}: {
  shifts: Shift[];
  onShiftsChange: (next: Shift[]) => void;
  setError: (msg: string | null) => void;
}) {
  const [newShiftOpen, setNewShiftOpen] = useState(false);
  const [blockSheet, setBlockSheet] = useState<{ shift: Shift; block: DownBlock } | null>(null);
  const [confirmEndShift, setConfirmEndShift] = useState(false);
  const [lumpSumOpen, setLumpSumOpen] = useState(false);

  const activeShift = shifts.find((s) => s.status === "active") || null;

  const createShift = async (
    type: ShiftType,
    downLength: 30 | 40,
    startTime: string,
    title: string,
    houseTaxPct: number,
    hourlyRate: number | null
  ) => {
    const { data, error: err } = await supabase
      .from("shifts")
      .insert({
        type,
        down_length: downLength,
        start_time: startTime,
        title,
        house_tax_pct: houseTaxPct,
        hourly_rate: hourlyRate,
        status: "active",
        blocks: buildBlocks(startTime, downLength),
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
      return;
    }
    onShiftsChange([data as Shift, ...shifts]);
    setNewShiftOpen(false);
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

  const endShift = async (
    settledStatus: "yes" | "no" | "partial" | null,
    settledAmount: number | null
  ): Promise<boolean> => {
    if (!activeShift) return false;
    const endedAt = new Date().toISOString();
    const { error: err } = await supabase
      .from("shifts")
      .update({
        status: "completed",
        ended_at: endedAt,
        settled_status: settledStatus,
        settled_amount: settledAmount,
      })
      .eq("id", activeShift.id);
    if (err) {
      setError(err.message);
      return false;
    }
    onShiftsChange(
      shifts.map((s) =>
        s.id === activeShift.id
          ? { ...s, status: "completed", ended_at: endedAt, settled_status: settledStatus, settled_amount: settledAmount }
          : s
      )
    );
    setConfirmEndShift(false);
    return true;
  };

  const extendShift = async (additionalMinutes: number) => {
    if (!activeShift) return;
    const nextBlocks = extendBlocks(activeShift.blocks, activeShift.down_length, additionalMinutes);
    const { error: err } = await supabase.from("shifts").update({ blocks: nextBlocks }).eq("id", activeShift.id);
    if (err) {
      setError(err.message);
      return;
    }
    onShiftsChange(shifts.map((s) => (s.id === activeShift.id ? { ...s, blocks: nextBlocks } : s)));
  };

  const logLumpSum = async (amount: number) => {
    if (!activeShift) return;
    const { error: err } = await supabase
      .from("shifts")
      .update({ is_lump_sum: true, lump_sum_tips: amount })
      .eq("id", activeShift.id);
    if (err) {
      setError(err.message);
      return;
    }
    onShiftsChange(
      shifts.map((s) => (s.id === activeShift.id ? { ...s, is_lump_sum: true, lump_sum_tips: amount } : s))
    );
    setLumpSumOpen(false);
  };

  const shiftTotal = (shift: Shift) =>
    shift.is_lump_sum
      ? shift.lump_sum_tips || 0
      : shift.blocks.reduce((sum, b) => sum + (b.status === "done" ? b.tips : 0), 0);
  const shiftDoneCount = (shift: Shift) => shift.blocks.filter((b) => b.status === "done").length;

  return (
    <>
      {!activeShift ? (
        <div className="text-center py-12 px-6 bg-td-surface rounded-2xl border border-td-border">
          <div className="w-13 h-13 rounded-full bg-td-surface2 flex items-center justify-center mx-auto mb-4 text-td-gold">
            <Spade size={26} />
          </div>
          <h2 className="font-display font-bold text-xl mb-1.5">No shift running</h2>
          <p className="text-td-muted text-[13.5px] mb-5 max-w-[280px] mx-auto">
            Start a shift and Trackdown will lay out your downs ahead of time.
          </p>
          <button
            onClick={() => setNewShiftOpen(true)}
            className="flex items-center justify-center gap-2 mx-auto rounded-[10px] py-3 px-6 font-bold text-sm bg-td-gold text-[#1a1305] hover:bg-td-goldsoft"
          >
            <Plus size={17} /> Start new shift
          </button>
        </div>
      ) : (
        <ShiftPanel
          shift={activeShift}
          total={shiftTotal(activeShift)}
          doneCount={shiftDoneCount(activeShift)}
          onBlockTap={(b) => setBlockSheet({ shift: activeShift, block: b })}
          onEndShift={() => setConfirmEndShift(true)}
          onExtend={extendShift}
          onLogLumpSum={() => setLumpSumOpen(true)}
        />
      )}

      {newShiftOpen && <NewShiftModal onCancel={() => setNewShiftOpen(false)} onCreate={createShift} />}

      {blockSheet && (
        <BlockSheet
          shiftType={blockSheet.shift.type}
          block={blockSheet.block}
          onCancel={() => setBlockSheet(null)}
          onSave={saveBlock}
        />
      )}

      {lumpSumOpen && activeShift && (
        <LumpSumModal
          currentAmount={activeShift.lump_sum_tips}
          onCancel={() => setLumpSumOpen(false)}
          onSave={logLumpSum}
        />
      )}

      {confirmEndShift && activeShift && (
        <EndShiftModal
          shift={activeShift}
          grossTotal={shiftTotal(activeShift)}
          onCancel={() => setConfirmEndShift(false)}
          onConfirm={endShift}
        />
      )}
    </>
  );
}
