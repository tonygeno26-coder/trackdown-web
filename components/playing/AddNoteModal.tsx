"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  PlayingBottomSheet,
  PlayingField,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
} from "@/components/playing/PlayingUi";
import { SheetFooter, TextareaInput } from "@/components/ui";

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
    <PlayingBottomSheet
      title="Add Note"
      onClose={onCancel}
      footer={
        <SheetFooter>
          <SecondaryPlayingButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </SecondaryPlayingButton>
          <PrimaryPlayingButton type="submit" form="add-note-form" disabled={saving}>
            <Check size={16} aria-hidden />
            {saving ? "Saving…" : "Save Note"}
          </PrimaryPlayingButton>
        </SheetFooter>
      }
    >
      <form id="add-note-form" onSubmit={submit}>
        <PlayingField label="Session notes">
          <TextareaInput
            className="min-h-[120px]"
            placeholder="Table change, strategy notes, etc."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        </PlayingField>
      </form>
    </PlayingBottomSheet>
  );
}
