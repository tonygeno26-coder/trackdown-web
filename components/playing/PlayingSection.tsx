"use client";

import { useState } from "react";
import { Plus, Spade } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PlayingSession } from "@/lib/types";
import NewPlayingSessionModal from "@/components/playing/NewPlayingSessionModal";
import ActivePlayingSession from "@/components/playing/ActivePlayingSession";
import AddBuyInModal from "@/components/playing/AddBuyInModal";
import EditPlayingSessionModal from "@/components/playing/EditPlayingSessionModal";
import EndPlayingSessionModal from "@/components/playing/EndPlayingSessionModal";
import PlayingSessionResult from "@/components/playing/PlayingSessionResult";

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
    const nextAdditional = (activeSession.additional_buy_ins || 0) + amount;
    const { error: err } = await supabase
      .from("playing_sessions")
      .update({ additional_buy_ins: nextAdditional })
      .eq("id", activeSession.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSessionsChange(
      sessions.map((s) =>
        s.id === activeSession.id ? { ...s, additional_buy_ins: nextAdditional } : s
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

  if (resultSession) {
    return (
      <PlayingSessionResult session={resultSession} onDismiss={() => setResultSession(null)} />
    );
  }

  return (
    <>
      {!activeSession ? (
        <div className="text-center py-12 px-6 bg-td-surface rounded-2xl border border-td-border">
          <div className="w-13 h-13 rounded-full bg-td-surface2 flex items-center justify-center mx-auto mb-4 text-td-gold">
            <Spade size={26} />
          </div>
          <h2 className="font-display font-bold text-xl mb-1.5">No session running</h2>
          <p className="text-td-muted text-[13.5px] mb-5 max-w-[280px] mx-auto">
            Track buy-ins, cash-outs, and your hourly win rate while you play.
          </p>
          <button
            onClick={() => setNewOpen(true)}
            className="flex items-center justify-center gap-2 mx-auto rounded-[10px] py-3 px-6 font-bold text-sm bg-td-gold text-[#1a1305] hover:bg-td-goldsoft"
          >
            <Plus size={17} /> Start playing session
          </button>
        </div>
      ) : (
        <ActivePlayingSession
          session={activeSession}
          onAddBuyIn={() => setAddBuyInOpen(true)}
          onEdit={() => setEditOpen(true)}
          onEnd={() => setEndOpen(true)}
        />
      )}

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
    </>
  );
}
