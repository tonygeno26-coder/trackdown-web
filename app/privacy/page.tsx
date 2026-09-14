import type { Metadata } from "next";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Trackdown — Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.bg}>
      <div className={styles.page}>
        <h1>Trackdown Privacy Policy</h1>
        <p className={styles.updated}>Last updated: September 13, 2026</p>

        <p>
          Trackdown (&quot;the app,&quot; &quot;we,&quot; &quot;our&quot;) is a shift and
          tip-tracking tool for poker dealers. This policy explains what information the app
          collects, how it&apos;s used, and your choices. We&apos;ve kept it short because the
          app itself is simple — it doesn&apos;t do anything with your data beyond what&apos;s
          described here.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Email address</strong> — if you choose to link an email to your account, so
            your shift history follows you across devices instead of being tied to one phone.
          </li>
          <li>
            <strong>Shift and earnings data you enter</strong> — this includes shift types
            (tournament, cash game, home game), down/block records, tips and tokes amounts, table
            or game names, shift notes, timestamps, and any house tax or settlement information
            you record.
          </li>
        </ul>
        <p>
          That&apos;s the complete list. Trackdown does not access your contacts, photos,
          location, camera, or microphone, and does not request any device permissions beyond
          what&apos;s needed to run the app.
        </p>

        <h2>How we use it</h2>
        <p>
          Your data is used only to provide the app&apos;s core function: tracking your shifts
          and calculating your earnings. We do not use your data for advertising, and we do not
          build profiles about you for any purpose beyond showing you your own tracked data back.
        </p>

        <h2>Who else sees it</h2>
        <p>
          We use a small number of service providers to make the app work. They process data on
          our behalf and are not permitted to use it for their own purposes:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — hosts the app&apos;s database, where your shift and
            account data is stored.
          </li>
          <li>
            <strong>Resend</strong> — delivers the sign-in emails used to link your account.
          </li>
        </ul>
        <p>
          We do not sell your data, and we do not share it with advertisers, data brokers, or any
          other third party.
        </p>

        <h2>Other dealers using the app</h2>
        <p>
          Your shift and tip data is private to your account. Other people using Trackdown cannot
          see your entries, and you cannot see theirs.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>
            You can use the app without ever linking an email — in that case your data stays tied
            to your device only.
          </li>
          <li>
            You can request deletion of your account and all associated data at any time by
            contacting us at <a href="mailto:support@trackdownpoker.com">support@trackdownpoker.com</a>.
          </li>
        </ul>

        <h2>Data retention</h2>
        <p>
          We keep your data for as long as your account is active. If you delete your account,
          your shift and tip records are permanently removed from our systems.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>
          Trackdown is intended for use by adults working as poker dealers and is not directed at
          children. We do not knowingly collect information from anyone under 18.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If this policy changes, we&apos;ll update the date at the top of this page. Continued
          use of the app after a change means you accept the update.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy or your data can be sent to{" "}
          <a href="mailto:support@trackdownpoker.com">support@trackdownpoker.com</a>.
        </p>

        <p className={styles.footerNote}>Trackdown is operated by Desert Spore LLC.</p>
      </div>
    </div>
  );
}
