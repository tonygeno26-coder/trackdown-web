"use client";

import { useEffect, useState } from "react";
import { Mail, Check, AlertTriangle } from "lucide-react";
import { sendMagicLink } from "@/lib/auth";
import {
  readLastAuthLinkError,
  clearLastAuthLinkError,
  AUTH_LINK_ERROR_EVENT,
  type AuthLinkError,
} from "@/lib/native-auth-link";
import { AppScreen, SurfaceCard, PrimaryButton, FormField, TextInput } from "@/components/ui";
import TrackdownHeader from "@/components/TrackdownHeader";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || !email.trim()) return;
    setSending(true);
    setError(null);
    const { error: err } = await sendMagicLink(email.trim());
    setSending(false);
    if (err) {
      setError(err);
      return;
    }
    setSent(true);
  };

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
            <h2 className="font-display text-lg font-bold uppercase tracking-[1px] text-td-cream">
              Check your email
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-td-muted">
              We sent a sign-in link to <span className="text-td-cream">{email}</span>. Open it on this
              device to finish signing in — your existing shifts will carry over automatically.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-td-border bg-td-surface2 text-td-gold">
              <Mail size={22} />
            </div>
            <h2 className="font-display text-lg font-bold uppercase tracking-[1px] text-td-cream">
              Sign in to Trackdown
            </h2>
            <p className="mt-2 mb-5 text-[13.5px] leading-relaxed text-td-muted">
              Enter your email and we&apos;ll send you a link to sign in — no password needed.
            </p>
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
                {sending ? "Sending…" : "Send Magic Link"}
              </PrimaryButton>
            </form>
          </>
        )}
      </SurfaceCard>
    </AppScreen>
  );
}
