"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteAccountViaEdgeFunction } from "@/lib/account-deletion";
import { MANAGE_APPLE_SUBSCRIPTIONS_URL } from "@/lib/legal-links";
import { resetPurchasesClient } from "@/lib/subscription";
import { useAuth } from "@/components/auth/AuthProvider";
import { SecondaryButton, PrimaryButton } from "@/components/ui";

type Step = "idle" | "warn" | "confirm" | "success" | "error";

export default function DeleteAccountFlow({ isGuest = false }: { isGuest?: boolean }) {
  const { signOut } = useAuth();
  const [step, setStep] = useState<Step>("idle");
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setErrorMessage(null);
    const result = await deleteAccountViaEdgeFunction();
    setDeleting(false);

    if (!result.ok) {
      setErrorMessage(result.error);
      setStep("confirm");
      return;
    }

    resetPurchasesClient();
    await signOut();
    setStep("success");
  };

  if (step === "success") {
    return (
      <p className="text-[13px] leading-relaxed text-td-goldsoft" role="status">
        Your Trackdown account was deleted. You can sign in again anytime with a new account.
      </p>
    );
  }

  if (step === "idle") {
    return (
      <SecondaryButton type="button" onClick={() => setStep("warn")}>
        <Trash2 size={16} /> Delete Account
      </SecondaryButton>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-td-red/40 bg-td-red/5 p-4">
      {step === "warn" && (
        <>
          {isGuest && (
            <p className="text-[13px] leading-relaxed text-td-cream">
              You are using a guest Trackdown account. Deleting it permanently removes all data tied to
              this device session. That data cannot be recovered after deletion, even if you sign in
              again later with the same email.
            </p>
          )}
          <p className="text-[13px] leading-relaxed text-td-cream">
            This permanently deletes your Trackdown account and all associated data stored in Trackdown
            (shifts, sessions, settings, saved hands, and related records). This cannot be undone.
          </p>
          <p className="text-[12.5px] leading-relaxed text-td-muted">
            Deleting your Trackdown account does <strong className="text-td-cream">not</strong> cancel an
            Apple subscription. Manage billing in Apple&apos;s Subscriptions settings.
          </p>
          <a
            href={MANAGE_APPLE_SUBSCRIPTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[12.5px] text-td-gold underline"
          >
            Manage Apple Subscription
          </a>
          <div className="flex flex-wrap gap-2 pt-1">
            <SecondaryButton type="button" onClick={() => setStep("idle")}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="button" onClick={() => setStep("confirm")}>
              Continue
            </PrimaryButton>
          </div>
        </>
      )}

      {(step === "confirm" || step === "error") && (
        <>
          <p className="text-[13px] font-semibold text-red-300">Final confirmation</p>
          <p className="text-[12.5px] leading-relaxed text-td-muted">
            Your account and all Trackdown data will be permanently removed.
          </p>
          {errorMessage && (
            <p role="alert" className="text-[12.5px] text-red-300">
              {errorMessage}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <SecondaryButton type="button" disabled={deleting} onClick={() => setStep("warn")}>
              Back
            </SecondaryButton>
            <PrimaryButton type="button" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Deleting…" : "Delete My Account Permanently"}
            </PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}
