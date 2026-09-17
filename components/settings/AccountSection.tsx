"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SettingsSection } from "@/components/settings/SettingsUi";
import { SecondaryButton } from "@/components/ui";

/**
 * Only rendered for a real, signed-in (non-anonymous) user — an anonymous
 * session has no linked account to sign out of. See DeveloperSettings for
 * the separate dev-only "new session" tool, which intentionally does the
 * opposite (creates a fresh anonymous session instead of landing on login).
 */
export default function AccountSection() {
  const { isAnonymous, email, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAnonymous) return null;

  const handleSignOut = async () => {
    setSigningOut(true);
    setError(null);
    const { error: err } = await signOut();
    setSigningOut(false);
    if (err) setError(err);
  };

  return (
    <SettingsSection title="Account" description={email ?? undefined}>
      <SecondaryButton type="button" disabled={signingOut} onClick={handleSignOut}>
        <LogOut size={16} /> {signingOut ? "Signing Out…" : "Sign Out"}
      </SecondaryButton>
      {error && (
        <p role="alert" className="text-[12.5px] text-red-300">
          {error}
        </p>
      )}
    </SettingsSection>
  );
}
