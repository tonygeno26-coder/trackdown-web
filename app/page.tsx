"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Spade } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Shift, DownBlock, ShiftType } from "@/lib/types";
import { buildBlocks, extendBlocks } from "@/lib/blocks";
import ShiftPanel from "@/components/ShiftPanel";
import NewShiftModal from "@/components/NewShiftModal";
import BlockSheet from "@/components/BlockSheet";
import EndShiftModal from "@/components/EndShiftModal";
import LumpSumModal from "@/components/LumpSumModal";
import HistoryList from "@/components/HistoryList";

export default function Home() {
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"today" | "history">("today");

  const [newShiftOpen, setNewShiftOpen] = useState(false);
  const [blockSheet, setBlockSheet] = useState<{ shift: Shift; block: DownBlock } | null>(null);
  const [confirmEndShift, setConfirmEndShift] = useState(false);
  const [lumpSumOpen, setLumpSumOpen] = useState(false);

  const loadShifts = useCallback(async () => {
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .order("start_time", { ascending: false });
    if (error) {
      setError(error.message);
      return;
    }
    setShifts(data as Shift[]);
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const activeShift = useMemo(() => (shifts || []).find((s) => s.status === "active") || null, [shifts]);
  const pastShifts = useMemo(() => (shifts || []).filter((s) => s.status !== "active"), [shifts]);

  const createShift = async (
    type: ShiftType,
    downLength: 30 | 40,
    startTime: string,
    title: string,
    houseTaxPct: number
  ) => {
    const { data, error } = await supabase
      .from("shifts")
      .insert({
        type,
        down_length: downLength,
        start_time: startTime,
        title,
        house_tax_pct: houseTaxPct,
        status: "active",
        blocks: buildBlocks(startTime, downLength),
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }
    setShifts((prev) => [data as Shift, ...(prev || [])]);
    setNewShiftOpen(false);
  };

  const saveBlock = async (updatedBlock: DownBlock) => {
    if (!blockSheet) return;
    const shift = blockSheet.shift;
    const nextBlocks = shift.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));

    const { error } = await supabase.from("shifts").update({ blocks: nextBlocks }).eq("id", shift.id);
    if (error) {
      setError(error.message);
      return;
    }
    setShifts((prev) => (prev || []).map((s) => (s.id === shift.id ? { ...s, blocks: nextBlocks } : s)));
    setBlockSheet(null);
  };

  const endShift = async (
    settledStatus: "yes" | "no" | "partial" | null,
    settledAmount: number | null
  ) => {
    if (!activeShift) return;
    const endedAt = new Date().toISOString();
    const { error } = await supabase
      .from("shifts")
      .update({
        status: "completed",
        ended_at: endedAt,
        settled_status: settledStatus,
        settled_amount: settledAmount,
      })
      .eq("id", activeShift.id);
    if (error) {
      setError(error.message);
      return;
    }
    setShifts((prev) =>
      (prev || []).map((s) =>
        s.id === activeShift.id
          ? { ...s, status: "completed", ended_at: endedAt, settled_status: settledStatus, settled_amount: settledAmount }
          : s
      )
    );
    setConfirmEndShift(false);
  };

  const extendShift = async (additionalMinutes: number) => {
    if (!activeShift) return;
    const nextBlocks = extendBlocks(activeShift.blocks, activeShift.down_length, additionalMinutes);
    const { error } = await supabase.from("shifts").update({ blocks: nextBlocks }).eq("id", activeShift.id);
    if (error) {
      setError(error.message);
      return;
    }
    setShifts((prev) => (prev || []).map((s) => (s.id === activeShift.id ? { ...s, blocks: nextBlocks } : s)));
  };

  const logLumpSum = async (amount: number) => {
    if (!activeShift) return;
    const { error } = await supabase
      .from("shifts")
      .update({ is_lump_sum: true, lump_sum_tips: amount })
      .eq("id", activeShift.id);
    if (error) {
      setError(error.message);
      return;
    }
    setShifts((prev) =>
      (prev || []).map((s) => (s.id === activeShift.id ? { ...s, is_lump_sum: true, lump_sum_tips: amount } : s))
    );
    setLumpSumOpen(false);
  };

  const deleteShift = async (id: string) => {
    const { error } = await supabase.from("shifts").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setShifts((prev) => (prev || []).filter((s) => s.id !== id));
  };

  const shiftTotal = (shift: Shift) =>
    shift.is_lump_sum
      ? shift.lump_sum_tips || 0
      : shift.blocks.reduce((sum, b) => sum + (b.status === "done" ? b.tips : 0), 0);
  const shiftDoneCount = (shift: Shift) => shift.blocks.filter((b) => b.status === "done").length;

  if (shifts === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-td-muted">
        <Spade size={26} className="animate-pulse text-td-gold" />
        <span>Loading Trackdown…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <header className="pt-9 pb-1 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="w-7 h-7 rounded-full bg-td-gold flex items-center justify-center text-td-cream text-sm">♠</span>
          <h1 className="font-display font-extrabold text-[24px] tracking-[3px] uppercase bg-gradient-to-b from-white to-td-muted bg-clip-text text-transparent">
            Trackdown
          </h1>
        </div>
        <p className="text-[10.5px] text-td-muted tracking-[1.5px] uppercase mt-1">Track every down. Own the night.</p>
      </header>

      <nav className="max-w-[520px] mx-auto mt-4 bg-td-surface rounded-[10px] p-1 flex gap-1">
        <button
          onClick={() => setView("today")}
          className={`flex-1 rounded-lg py-2 text-[13.5px] font-semibold ${
            view === "today" ? "bg-td-gold text-[#1a1305]" : "text-td-muted"
          }`}
        >
          Shift
        </button>
        <button
          onClick={() => setView("history")}
          className={`flex-1 rounded-lg py-2 text-[13.5px] font-semibold ${
            view === "history" ? "bg-td-gold text-[#1a1305]" : "text-td-muted"
          }`}
        >
          History
        </button>
      </nav>

      {error && (
        <div className="max-w-[520px] mx-auto mt-2.5 px-4 py-2.5 bg-[#331d1d] border border-td-red rounded-lg text-[13px] text-center">
          {error}
        </div>
      )}

      <main className="max-w-[520px] mx-auto px-5 pt-4.5 pb-5">
        {view === "today" &&
          (!activeShift ? (
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
          ))}

        {view === "history" && (
          <HistoryList
            shifts={pastShifts}
            onBlockTap={(shift, block) => setBlockSheet({ shift, block })}
            onDeleteShift={deleteShift}
          />
        )}
      </main>

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
    </div>
  );
}
