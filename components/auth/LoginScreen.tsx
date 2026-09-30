"use client";

import { useEffect, useState } from "react";
import { Mail, Check, AlertTriangle } from "lucide-react";
import { sendGuestEmailLink, sendReturningUserSignIn } from "@/lib/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  readLastAuthLinkError,
  clearLastAuthLinkError,
  AUTH_LINK_ERROR_EVENT,
  type AuthLinkError,
} from "@/lib/native-auth-link";
import { AppScreen, SurfaceCard, PrimaryButton, FormField, TextInput } from "@/components/ui";
import TrackdownHeader from "@/components/TrackdownHeader";
import AccountSection from "@/components/settings/AccountSection";

type EmailFlow = "guest-link" | "returning-sign-in";

export default function LoginScreen() {
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [flow, setFlow] = useState<EmailFlow>("guest-link");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<AuthLinkError | null>(null);

  // Surfaces a failure from a previous magic-link tap that couldn't complete
  // (e.g. the deep-link code exchange failed) — there's no way to attach a
  // remote console to a physical device after the fact, so this is the only
  // way that failure becomes visible at all.
  useEffect(() => {
    setLinkError(readLastAuthLinkError());
    const onLinkError = (e: Event) => setLinkError((e as CustomEvent<AuthLinkError>).detail);
    window.addEventListener(AUTH_LINK_ERROR_EVENT, onLinkError);
    return () => window.removeEventListener(AUTH_LINK_ERROR_EVENT, onLinkError);
  }, []);

  const dismissLinkError = () => {
    clearLastAuthLinkError();
    setLinkError(null);
  };

  const switchFlow = (next: EmailFlow) => {
    if (sending) return;
    setFlow(next);
    setError(null);
    setSent(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || !email.trim()) return;
    setSending(true);
    setError(null);
    setSent(false);

    const trimmed = email.trim();
    const result =
      flow === "guest-link" ? await sendGuestEmailLink(trimmed) : await sendReturningUserSignIn(trimmed);

    setSending(false);

    if ("signedInDirectly" in result && result.signedInDirectly) {
      await refreshSession();
      return;
    }

    if ("ok" in result && !result.ok) {
      setError(result.message);
      return;
    }

    if ("ok" in result && result.ok) {
      setSent(true);
    }
  };

  const sentTitle =
    flow === "guest-link" ? "Check your email to save this guest" : "Check your email to sign in";
  const sentBody =
    flow === "guest-link" ? (
      <>
        We sent a link to <span className="text-td-cream">{email}</span>. Open it on this device to attach
        that email to your current guest account — your shifts on this device stay with the same account.
      </>
    ) : (
      <>
        We sent a sign-in link to <span className="text-td-cream">{email}</span>. Open it on this device to
        sign in to your existing account.
      </>
    );

  return (
    <AppScreen>
      <TrackdownHeader />
      {linkError && (
        <div className="mb-4 rounded-xl border border-td-red/50 bg-td-red/10 px-4 py-3 text-left text-[12.5px] text-red-300">
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Your last sign-in link didn&apos;t complete</p>
              <p className="mt-1 text-red-300/90">{linkError.error}</p>
              <p className="mt-1 text-[11px] text-red-300/70">
                {linkError.source} · {new Date(linkError.at).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissLinkError}
              className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-red-300/80 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <SurfaceCard className="px-6 py-8 text-center">
        {sent ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-td-gold/40 bg-td-gold/10 text-td-gold">
              <Check size={24} />
            </div>
            <h2 className="font-display text-lg font-bold uppercase tracking-[1px] text-td-cream">{sentTitle}</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-td-muted">{sentBody}</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-td-border bg-td-surface2 text-td-gold">
              <Mail size={22} />
            </div>
            {flow === "guest-link" ? (
              <>
                <h2 className="font-display text-lg font-bold uppercase tracking-[1px] text-td-cream">
                  Save guest account with email
                </h2>
                <p className="mt-2 mb-5 text-[13.5px] leading-relaxed text-td-muted">
                  Add an email to the guest session on this device so your Trackdown shifts and sessions stay
                  tied to one account. We&apos;ll email you a link — no password.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display text-lg font-bold uppercase tracking-[1px] text-td-cream">
                  Sign in to your account
                </h2>
                <p className="mt-2 mb-3 text-[13.5px] leading-relaxed text-td-muted">
                  Already saved an email on another device? We&apos;ll send a sign-in link to that address.
                </p>
                <p className="mb-5 rounded-lg border border-td-border/80 bg-td-surface2/60 px-3 py-2 text-left text-[12px] leading-relaxed text-td-muted">
                  Signing in here replaces the guest session on this device with your existing account. Your
                  guest data on this phone won&apos;t merge automatically — we don&apos;t delete the old guest
                  account on our servers.
                </p>
              </>
            )}
            <form onSubmit={submit} className="space-y-4 text-left">
              <FormField label="Email">
                <TextInput
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
              {error && (
                <p role="alert" className="text-[12.5px] text-red-300">
                  {error}
                </p>
              )}
              <PrimaryButton type="submit" disabled={sending}>
                {sending
                  ? "Sending…"
                  : flow === "guest-link"
                    ? "Email link to save guest"
                    : "Send sign-in link"}
              </PrimaryButton>
            </form>
            <div className="mt-5 text-[13px] text-td-muted">
              {flow === "guest-link" ? (
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => switchFlow("returning-sign-in")}
                  className="font-semibold text-td-gold underline disabled:opacity-50"
                >
                  Already have an account? Sign in
                </button>
              ) : (
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => switchFlow("guest-link")}
                  className="font-semibold text-td-gold underline disabled:opacity-50"
                >
                  New here — save this guest with email
                </button>
              )}
            </div>
          </>
        )}
      </SurfaceCard>
      <div className="mt-8">
        <AccountSection />
      </div>
    </AppScreen>
  );
}
