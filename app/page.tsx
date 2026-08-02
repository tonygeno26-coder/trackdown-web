"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Spade, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Shift, DownBlock, ShiftType } from "@/lib/types";
import { buildBlocks } from "@/lib/blocks";
import ShiftPanel from "@/components/ShiftPanel";
import NewShiftModal from "@/components/NewShiftModal";
import BlockSheet from "@/components/BlockSheet";
import HistoryList from "@/components/HistoryList";

export default function Home() {
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"today" | "history">("today");

  const [newShiftOpen, setNewShiftOpen] = useState(false);
  const [blockSheet, setBlockSheet] = useState<{ shift: Shift; block: DownBlock } | null>(null);
  const [confirmEndShift, setConfirmEndShift] = useState(false);

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

  const createShift = async (type: ShiftType, downLength: 30 | 40, startTime: string) => {
    const { data, error } = await supabase
      .from("shifts")
      .insert({
        type,
        down_length: downLength,
        start_time: startTime,
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

  const endShift = async () => {
    if (!activeShift) return;
    const endedAt = new Date().toISOString();
    const { error } = await supabase
      .from("shifts")
      .update({ status: "completed", ended_at: endedAt })
      .eq("id", activeShift.id);
    if (error) {
      setError(error.message);
      return;
    }
    setShifts((prev) =>
      (prev || []).map((s) => (s.id === activeShift.id ? { ...s, status: "completed", ended_at: endedAt } : s))
    );
    setConfirmEndShift(false);
  };

  const deleteShift = async (id: string) => {
    const { error } = await supabase.from("shifts").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setShifts((prev) => (prev || []).filter((s) => s.id !== id));
  };

  const shiftTotal = (shift: Shift) => shift.blocks.reduce((sum, b) => sum + (b.status === "done" ? b.tips : 0), 0);
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
      <header className="pt-8 pb-1.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-td-gold text-lg">♠</span>
          <h1 className="font-display font-bold text-[22px] tracking-[3px] uppercase">Trackdown</h1>
        </div>
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

      {confirmEndShift && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75"
          onClick={() => setConfirmEndShift(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] bg-td-surface border border-td-border rounded-t-2xl px-5 pt-5 pb-6 flex flex-col gap-3.5"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-display font-bold text-lg tracking-wide">End this shift?</h2>
              <button onClick={() => setConfirmEndShift(false)} className="text-td-muted p-1 rounded">
                <X size={18} />
              </button>
            </div>
            <p className="text-[13.5px] text-td-muted -mt-1.5">
              Unlogged downs will be left blank and the shift moves to History.
            </p>
            <div className="flex gap-2.5 mt-1.5">
              <button
                onClick={() => setConfirmEndShift(false)}
                className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-surface2 border border-td-border text-td-cream"
              >
                Cancel
              </button>
              <button
                onClick={endShift}
                className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-red text-td-cream"
              >
                End shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
