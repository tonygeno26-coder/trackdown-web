"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PlayingSession } from "@/lib/types";
import { getGamingCategory } from "@/lib/gaming";
import { appendAdditionalBuyIn } from "@/lib/db-mutations";
import { saveHand } from "@/lib/hands/storage";
import { SavedHandInput } from "@/lib/hands/types";
import NewPlayingSessionModal from "@/components/playing/NewPlayingSessionModal";
import ActivePlayingSession from "@/components/playing/ActivePlayingSession";
import AddBuyInModal from "@/components/playing/AddBuyInModal";
import EditPlayingSessionModal from "@/components/playing/EditPlayingSessionModal";
import EndPlayingSessionModal from "@/components/playing/EndPlayingSessionModal";
import PlayingSessionResult from "@/components/playing/PlayingSessionResult";
import HandBuilderModal from "@/components/train/my-hands/HandBuilderModal";
import PlayingEmptyState from "@/components/playing/PlayingEmptyState";
import { PlayingShell } from "@/components/playing/PlayingUi";

export default function PlayingSection({
  sessions,
  onSessionsChange,
  setError,
}: {
  sessions: PlayingSession[];
  onSessionsChange: (next: PlayingSession[]) => void;
  setError: (msg: string | null) => void;
}) {
  const [newOpen, setNewOpen] = useState(false);
  const [addBuyInOpen, setAddBuyInOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [resultSession, setResultSession] = useState<PlayingSession | null>(null);
  const [handBuilderOpen, setHandBuilderOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeSession = sessions.find((s) => s.status === "active") || null;

  const createSession = async (data: {
    session_type: PlayingSession["session_type"];
    title: string;
    location: string;
    game: string;
    stakes: string;
    start_time: string;
    initial_buy_in: number;
  }) => {
    if (activeSession) {
      setError("Finish your current playing session before starting a new one.");
      return;
    }
    setSaving(true);
    const { data: row, error: err } = await supabase
      .from("playing_sessions")
      .insert({ ...data, status: "active" })
      .select()
      .single();
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSessionsChange([row as PlayingSession, ...sessions]);
    setNewOpen(false);
  };

  const addBuyIn = async (amount: number) => {
    if (!activeSession) return;
    setSaving(true);
    const { additionalBuyIns, error: err } = await appendAdditionalBuyIn(activeSession.id, amount);
    setSaving(false);
    if (err || additionalBuyIns == null) {
      setError(err ?? "Could not add buy-in.");
      return;
    }
    onSessionsChange(
      sessions.map((s) =>
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
    if (!activeSession) return;
    setSaving(true);
    const { error: err } = await supabase
      .from("playing_sessions")
      .update(updates)
      .eq("id", activeSession.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSessionsChange(
      sessions.map((s) => (s.id === activeSession.id ? { ...s, ...updates } : s))
    );
    setEditOpen(false);
  };

  const endSession = async (data: { cash_out: number; expenses: number; notes: string }) => {
    if (!activeSession) return;
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
      sessions.map((s) => (s.id === activeSession.id ? (row as PlayingSession) : s))
    );
    setEndOpen(false);
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
    <PlayingShell>
      <AnimatePresence mode="wait">
        {resultSession ? (
          <PlayingSessionResult
            key="result"
            session={resultSession}
            onDismiss={() => setResultSession(null)}
            showSaveHandPrompt={isPokerResult}
            onSaveHand={isPokerResult ? () => setHandBuilderOpen(true) : undefined}
          />
        ) : !activeSession ? (
          <PlayingEmptyState key="empty" onStart={() => setNewOpen(true)} />
        ) : (
          <ActivePlayingSession
            key="active"
            session={activeSession}
            onAddBuyIn={() => setAddBuyInOpen(true)}
            onEdit={() => setEditOpen(true)}
            onEnd={() => setEndOpen(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newOpen && (
          <NewPlayingSessionModal
            onCancel={() => setNewOpen(false)}
            onCreate={createSession}
            saving={saving}
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
        {endOpen && activeSession && (
          <EndPlayingSessionModal
            session={activeSession}
            onCancel={() => setEndOpen(false)}
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
      </AnimatePresence>
    </PlayingShell>
  );
}
