"use client";

import { ReactNode } from "react";
import {
  BottomSheet,
  SheetFooter,
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
} from "@/components/ui";

export function ConfirmSheet({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
  busy,
  destructive,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
  destructive?: boolean;
}) {
  const ConfirmBtn = destructive ? DestructiveButton : PrimaryButton;
  return (
    <BottomSheet
      title={title}
      onClose={onCancel}
      destructive={destructive}
      footer={
        <SheetFooter>
          <SecondaryButton type="button" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </SecondaryButton>
          <ConfirmBtn type="button" onClick={onConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </ConfirmBtn>
        </SheetFooter>
      }
    >
      <p className="text-[14px] leading-relaxed text-td-muted">{message}</p>
    </BottomSheet>
  );
}

export function DealingBottomSheet({
  title,
  onClose,
  children,
  footer,
  destructive,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  destructive?: boolean;
}) {
  return (
    <BottomSheet title={title} onClose={onClose} footer={footer} destructive={destructive}>
      {children}
    </BottomSheet>
  );
}
