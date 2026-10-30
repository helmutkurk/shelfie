import { useState } from "react";
import { PayoutAddressSchema } from "@shelfie/core/browser";
import { S } from "../lib/messages.js";
import type { Profile } from "../lib/storage.js";
import { Button, Field, Group, LargeTitle, TextButton, Wordmark } from "../ui/index.js";

/** W0: payout address + name + consent-v1. CIP-30 "Connect wallet" is not built (verify Friday). */
export function Onboarding(props: {
  initial: Profile | null;
  consented: boolean;
  onSave: (profile: Profile) => void;
  onDecline: () => void;
}) {
  const [address, setAddress] = useState(props.initial?.address ?? "");
  const [name, setName] = useState(props.initial?.name ?? "");
  const [agreed, setAgreed] = useState(props.consented);
  const [touched, setTouched] = useState(false);

  const parsed = PayoutAddressSchema.safeParse(address.trim());
  const addressError =
    touched && !parsed.success
      ? "Paste a Cardano preprod address. It starts with addr_test1."
      : undefined;
  const canContinue = parsed.success && agreed;

  return (
    <main className="screen">
      <div className="onboard-brand">
        <Wordmark />
      </div>
      <LargeTitle
        title="Get paid for photos that prove the shelf."
        subtitle="Take a task, photograph one price tag, receive test ADA."
      />
      <Group footer={`${S.shelvesOnly} Your address is where payouts go; nothing else is stored.`}>
        <div className="group-pad">
          {/* TODO verify Friday: "Connect wallet" via window.cardano (CIP-30) when present; paste is the guaranteed path. */}
          <Field
            label="Payout address"
            value={address}
            onChange={setAddress}
            onBlur={() => setTouched(true)}
            error={addressError}
            placeholder="addr_test1..."
          />
          <Field
            label="Name (shown to you only)"
            value={name}
            onChange={setName}
            autoComplete="given-name"
          />
        </div>
      </Group>
      <Group label="Privacy" footer={`Version ${S.consentVersion}`}>
        <div className="group-pad">
          <p className="subhead">{S.consentText}</p>
          <label className="check-row">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>I have read this and agree.</span>
          </label>
        </div>
      </Group>
      <div className="action-bar">
        <Button
          disabled={!canContinue}
          onClick={() => props.onSave({ name: name.trim().slice(0, 60), address: address.trim() })}
        >
          Continue
        </Button>
        <TextButton onClick={props.onDecline}>Decline and only look around</TextButton>
      </div>
    </main>
  );
}
