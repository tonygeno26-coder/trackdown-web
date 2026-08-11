"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Shift, DownBlock, ShiftType, PlayingSession, PlayingSessionType } from "@/lib/types";
import { buildBlocks, extendBlocks } from "@/lib/blocks";
import { GamingCategory, getGamingCategory } from "@/lib/gaming";
import { saveHand } from "@/lib/hands/storage";
import { SavedHandInput } from "@/lib/hands/types";
import { appendAdditionalBuyIn, replaceShiftBlock, updateShiftBlock } from "@/lib/db-mutations";
import HandBuilderModal from "@/components/train/my-hands/HandBuilderModal";
import { createPreviewDealerShift, createPreviewGamingSession } from "@/lib/preview-data";
import EmptyHomeState from "@/components/home/EmptyHomeState";
import DealerCockpit from "@/components/home/DealerCockpit";
import GamingCockpit from "@/components/home/GamingCockpit";
import NewShiftModal from "@/components/NewShiftModal";
import BlockSheet from "@/components/BlockSheet";
import EndShiftModal from "@/components/EndShiftModal";
import LumpSumModal from "@/components/LumpSumModal";
import NewGamingSessionModal from "@/components/playing/NewGamingSessionModal";
import AddBuyInModal from "@/components/playing/AddBuyInModal";
import EditPlayingSessionModal from "@/components/playing/EditPlayingSessionModal";
import EndPlayingSessionModal from "@/components/playing/EndPlayingSessionModal";
import AddNoteModal from "@/components/playing/AddNoteModal";
import PlayingSessionResult from "@/components/playing/PlayingSessionResult";
import { AppScreen } from "@/components/ui";
import DeveloperPreviewBanner from "@/components/dev/DeveloperPreviewBanner";
import { useDeveloperPreview } from "@/components/dev/DeveloperPreviewProvider";
import { useAuth } from "@/components/auth/AuthProvider";

export default function HomeDashboard({
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
  const { previewMode, isPreviewActive } = useDeveloperPreview();
  const { userId } = useAuth();

  const realActiveShift = shifts.find((s) => s.status === "active" && !s.is_demo) || null;
  const realActiveSession =
    playingSessions.find((s) => s.status === "active" && !s.is_demo) || null;

  const previewShift = previewMode === "dealer" ? createPreviewDealerShift() : null;
  const previewSession = previewMode === "gaming" ? createPreviewGamingSession() : null;

  const activeShift = isPreviewActive
    ? previewMode === "dealer"
      ? previewShift
      : previewMode === "empty"
        ? null
        : realActiveShift
    : realActiveShift;

  const activeSession = isPreviewActive
    ? previewMode === "gaming"
      ? previewSession
      : previewMode === "empty"
        ? null
        : realActiveSession
    : realActiveSession;

  const hasConflict = !isPreviewActive && !!realActiveShift && !!realActiveSession;

  const [newShiftOpen, setNewShiftOpen] = useState(false);
  const [newGamingOpen, setNewGamingOpen] = useState(false);
  const [blockSheet, setBlockSheet] = useState<{ shift: Shift; block: DownBlock } | null>(null);
  const [confirmEndShift, setConfirmEndShift] = useState(false);
  const [lumpSumOpen, setLumpSumOpen] = useState(false);
  const [addBuyInOpen, setAddBuyInOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [endGamingOpen, setEndGamingOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [resultSession, setResultSession] = useState<PlayingSession | null>(null);
  const [handBuilderOpen, setHandBuilderOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const shiftTotal = (shift: Shift) =>
    shift.is_lump_sum
      ? shift.lump_sum_tips || 0
      : shift.blocks.reduce((sum, b) => sum + (b.status === "done" ? b.tips : 0), 0);
  const shiftDoneCount = (shift: Shift) => shift.blocks.filter((b) => b.status === "done").length;

  const guardPreview = () => {
    if (isPreviewActive) {
      setError("Clear Developer Preview before performing real actions.");
      return false;
    }
    return true;
  };

  const guardStart = () => {
    if (!guardPreview()) return false;
    if (realActiveShift) {
      setError("End your current dealer shift before starting a new activity.");
      return false;
    }
    if (realActiveSession) {
      setError("End your current gaming session before starting a new activity.");
      return false;
    }
    return true;
  };

  const guardMutation = () => guardPreview();

  const createShift = async (
    type: ShiftType,
    downLength: 30 | 40,
    startTime: string,
    title: string,
    houseTaxPct: number,
    hourlyRate: number | null
  ) => {
    if (!guardStart() || !userId) return;
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
        user_id: userId,
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

  const createGamingSession = async (data: {
    category: GamingCategory;
    session_type: PlayingSessionType;
    location: string;
    game: string;
    stakes: string;
    start_time: string;
    initial_buy_in: number;
    notes: string;
  }) => {
    if (!guardStart() || !userId) return;
    setSaving(true);
    const { data: row, error: err } = await supabase
      .from("playing_sessions")
      .insert({
        title: data.category,
        session_type: data.session_type,
        location: data.location,
        game: data.game,
        stakes: data.stakes,
        start_time: data.start_time,
        initial_buy_in: data.initial_buy_in,
        notes: data.notes,
        status: "active",
        user_id: userId,
      })
      .select()
      .single();
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSessionsChange([row as PlayingSession, ...playingSessions]);
    setNewGamingOpen(false);
  };

  const saveBlock = async (updatedBlock: DownBlock) => {
    if (!guardMutation() || !blockSheet) return;
    const shift = blockSheet.shift;
    const { blocks: nextBlocks, error: err } = await replaceShiftBlock(shift.id, updatedBlock);
    if (err || !nextBlocks) {
      setError(err ?? "Could not save down.");
      return;
    }
    onShiftsChange(shifts.map((s) => (s.id === shift.id ? { ...s, blocks: nextBlocks } : s)));
    setBlockSheet(null);
  };

  const quickBlockUpdate = async (block: DownBlock, update: Partial<DownBlock>) => {
    if (!guardMutation() || !activeShift || activeShift.id.startsWith("preview-")) return;
    const { blocks: nextBlocks, error: err } = await updateShiftBlock(activeShift.id, block.id, (b) => ({
      ...b,
      ...update,
    }));
    if (err || !nextBlocks) {
      setError(err ?? "Could not update down.");
      return;
    }
    onShiftsChange(shifts.map((s) => (s.id === activeShift.id ? { ...s, blocks: nextBlocks } : s)));
  };

  const endShift = async (
    settledStatus: "yes" | "no" | "partial" | null,
    settledAmount: number | null
  ): Promise<boolean> => {
    if (!guardMutation() || !activeShift || activeShift.id.startsWith("preview-")) return false;
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
    if (!guardMutation() || !activeShift || activeShift.id.startsWith("preview-")) return;
    const nextBlocks = extendBlocks(activeShift.blocks, activeShift.down_length, additionalMinutes);
    const { error: err } = await supabase.from("shifts").update({ blocks: nextBlocks }).eq("id", activeShift.id);
    if (err) {
      setError(err.message);
      return;
    }
    onShiftsChange(shifts.map((s) => (s.id === activeShift.id ? { ...s, blocks: nextBlocks } : s)));
  };

  const logLumpSum = async (amount: number) => {
    if (!guardMutation() || !activeShift || activeShift.id.startsWith("preview-")) return;
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

  const addBuyIn = async (amount: number) => {
    if (!guardMutation() || !activeSession || activeSession.id.startsWith("preview-")) return;
    setSaving(true);
    const { additionalBuyIns, error: err } = await appendAdditionalBuyIn(activeSession.id, amount);
    setSaving(false);
    if (err || additionalBuyIns == null) {
      setError(err ?? "Could not add buy-in.");
      return;
    }
    onSessionsChange(
      playingSessions.map((s) =>
        s.id === activeSession.id ? { ...s, additional_buy_ins: additionalBuyIns } : s
      )
    );
    setAddBuyInOpen(false);
  };

  const saveEdit = async (updates: {
    title: string;
    location: string;
    game: string;
    stakes: string;
    start_time: string;
    initial_buy_in: number;
  }) => {
    if (!guardMutation() || !activeSession || activeSession.id.startsWith("preview-")) return;
    setSaving(true);
    const category = activeSession.title;
    const { error: err } = await supabase
      .from("playing_sessions")
      .update({ ...updates, title: category })
      .eq("id", activeSession.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSessionsChange(
      playingSessions.map((s) => (s.id === activeSession.id ? { ...s, ...updates, title: category } : s))
    );
    setEditOpen(false);
  };

  const saveNote = async (notes: string) => {
    if (!guardMutation() || !activeSession || activeSession.id.startsWith("preview-")) return;
    setSaving(true);
    const { error: err } = await supabase
      .from("playing_sessions")
      .update({ notes })
      .eq("id", activeSession.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSessionsChange(playingSessions.map((s) => (s.id === activeSession.id ? { ...s, notes } : s)));
    setNoteOpen(false);
  };

  const endSession = async (data: { cash_out: number; expenses: number; notes: string }) => {
    if (!guardMutation() || !activeSession || activeSession.id.startsWith("preview-")) return;
    setSaving(true);
    const endedAt = new Date().toISOString();
    const { data: row, error: err } = await supabase
      .from("playing_sessions")
      .update({
        status: "completed",
        ended_at: endedAt,
        cash_out: data.cash_out,
        expenses: data.expenses,
        notes: data.notes,
      })
      .eq("id", activeSession.id)
      .select()
      .single();
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSessionsChange(
      playingSessions.map((s) => (s.id === activeSession.id ? (row as PlayingSession) : s))
    );
    setEndGamingOpen(false);
    setResultSession(row as PlayingSession);
  };

  const saveHandFromSession = async (input: SavedHandInput) => {
    setSaving(true);
    const { error: err } = await saveHand(input);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setHandBuilderOpen(false);
    setResultSession(null);
  };

  const isPokerResult =
    resultSession != null && getGamingCategory(resultSession) === "poker";

  return (
    <AppScreen>
      <DeveloperPreviewBanner />

      {hasConflict && (
        <div className="mb-4 rounded-xl border border-td-red/50 bg-td-red/10 px-4 py-3 text-center text-[13px] text-red-300">
          Both a dealer shift and gaming session are active. End one to continue normally.
        </div>
      )}

      <AnimatePresence mode="wait">
        {resultSession ? (
          <PlayingSessionResult
            key="result"
            session={resultSession}
            dismissLabel="Return Home"
            onDismiss={() => setResultSession(null)}
            showSaveHandPrompt={isPokerResult}
            onSaveHand={isPokerResult ? () => setHandBuilderOpen(true) : undefined}
          />
        ) : activeShift ? (
          <DealerCockpit
            key="dealer"
            shift={activeShift}
            total={shiftTotal(activeShift)}
            doneCount={shiftDoneCount(activeShift)}
            onLogDown={(block) => setBlockSheet({ shift: activeShift, block })}
            onBreak={(block) =>
              quickBlockUpdate(block, { status: "break", table: "", game: "", tips: 0, tournament: "", notes: "" })
            }
            onSkip={(block) => quickBlockUpdate(block, { status: "skipped" })}
            onEndShift={() => setConfirmEndShift(true)}
            onExtend={extendShift}
            onLogLumpSum={() => setLumpSumOpen(true)}
            onBlockTap={(block) => setBlockSheet({ shift: activeShift, block })}
          />
        ) : activeSession ? (
          <GamingCockpit
            key="gaming"
            session={activeSession}
            onAddBuyIn={() => setAddBuyInOpen(true)}
            onEdit={() => setEditOpen(true)}
            onAddNote={() => setNoteOpen(true)}
            onEnd={() => setEndGamingOpen(true)}
          />
        ) : (
          <EmptyHomeState
            key="empty"
            onStartDealer={() => (guardStart() ? setNewShiftOpen(true) : undefined)}
            onStartGaming={() => (guardStart() ? setNewGamingOpen(true) : undefined)}
          />
        )}
      </AnimatePresence>

      {newShiftOpen && <NewShiftModal onCancel={() => setNewShiftOpen(false)} onCreate={createShift} />}

      {newGamingOpen && (
        <NewGamingSessionModal
          onCancel={() => setNewGamingOpen(false)}
          onCreate={createGamingSession}
          saving={saving}
        />
      )}

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

      {addBuyInOpen && activeSession && (
        <AddBuyInModal
          isTournament={activeSession.session_type === "tournament"}
          onCancel={() => setAddBuyInOpen(false)}
          onSave={addBuyIn}
          saving={saving}
        />
      )}

      {editOpen && activeSession && (
        <EditPlayingSessionModal
          session={activeSession}
          onCancel={() => setEditOpen(false)}
          onSave={saveEdit}
          saving={saving}
        />
      )}

      {noteOpen && activeSession && (
        <AddNoteModal
          notes={activeSession.notes}
          onCancel={() => setNoteOpen(false)}
          onSave={saveNote}
          saving={saving}
        />
      )}

      {endGamingOpen && activeSession && (
        <EndPlayingSessionModal
          session={activeSession}
          onCancel={() => setEndGamingOpen(false)}
          onSave={endSession}
          saving={saving}
        />
      )}

      {handBuilderOpen && resultSession && (
        <HandBuilderModal
          defaults={{
            session_id: resultSession.id,
            casino: resultSession.location,
            game: resultSession.game,
            stakes: resultSession.stakes,
            played_at: resultSession.ended_at ?? resultSession.start_time,
          }}
          onCancel={() => setHandBuilderOpen(false)}
          onSave={saveHandFromSession}
          saving={saving}
        />
      )}
    </AppScreen>
  );
}
