"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SettingsSection } from "@/components/settings/SettingsUi";
import { SecondaryButton } from "@/components/ui";
import DeleteAccountFlow from "@/components/settings/DeleteAccountFlow";

/**
 * Email-linked users see this under Settings → Account. Anonymous (guest)
 * users see the same block on the sign-in screen — they cannot open Settings
 * until an email is linked, but their Supabase auth id still owns stored data.
 */
export default function AccountSection() {
  const { isAnonymous, email, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountDescription = isAnonymous
    ? "Guest account (not linked to an email)"
    : (email ?? undefined);

  const handleSignOut = async () => {
    setSigningOut(true);
    setError(null);
    const { error: err } = await signOut();
    setSigningOut(false);
    if (err) setError(err);
  };

  return (
    <SettingsSection title="Account" description={accountDescription}>
      {!isAnonymous && (
        <SecondaryButton type="button" disabled={signingOut} onClick={handleSignOut}>
          <LogOut size={16} /> {signingOut ? "Signing Out…" : "Sign Out"}
        </SecondaryButton>
      )}
      {error && (
        <p role="alert" className="text-[12.5px] text-red-300">
          {error}
        </p>
      )}
      <DeleteAccountFlow isGuest={isAnonymous} />
    </SettingsSection>
  );
}
