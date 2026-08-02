"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  PlayingBottomSheet,
  PlayingField,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
  playingInputClass,
} from "@/components/playing/PlayingUi";

export default function AddNoteModal({
  notes,
  onCancel,
  onSave,
  saving,
}: {
  notes: string;
  onCancel: () => void;
  onSave: (notes: string) => void;
  saving: boolean;
}) {
  const [value, setValue] = useState(notes);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    onSave(value);
  };

  return (
    <PlayingBottomSheet title="Add Note" onClose={onCancel}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <PlayingField label="Session notes">
          <textarea
            className={`${playingInputClass} min-h-[120px] resize-none`}
            placeholder="Table change, strategy notes, etc."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        </PlayingField>
        <div className="grid grid-cols-2 gap-3">
          <SecondaryPlayingButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </SecondaryPlayingButton>
          <PrimaryPlayingButton type="submit" disabled={saving}>
            <Check size={16} />
            {saving ? "Saving…" : "Save Note"}
          </PrimaryPlayingButton>
        </div>
      </form>
    </PlayingBottomSheet>
  );
}
