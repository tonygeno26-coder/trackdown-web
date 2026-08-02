"use client";

import { DealingBottomSheet } from "@/components/dealing/DealingUi";
import { SheetFooter, SecondaryButton, PrimaryButton } from "@/components/ui";

export default function AddTimeSheet({
  onCancel,
  onExtend,
}: {
  onCancel: () => void;
  onExtend: (minutes: number) => void;
}) {
  return (
    <DealingBottomSheet
      title="Add More Time"
      onClose={onCancel}
      footer={
        <SheetFooter>
          <SecondaryButton type="button" onClick={onCancel}>
            Cancel
          </SecondaryButton>
        </SheetFooter>
      }
    >
      <p className="text-[14px] text-td-muted">Add how much more time?</p>
      <div className="mt-4 flex gap-2">
        {[60, 120, 240].map((mins) => (
          <PrimaryButton
            key={mins}
            type="button"
            onClick={() => onExtend(mins)}
            className="flex-1 min-h-[48px] py-3 text-[13px]"
          >
            {mins < 120 ? `${mins}m` : `${mins / 60}h`}
          </PrimaryButton>
        ))}
      </div>
    </DealingBottomSheet>
  );
}
