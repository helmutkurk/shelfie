import { useState } from "react";
import type { ClaimResponse } from "@shelfie/core/browser";
import { Button, Countdown, NavBar, TextButton } from "../ui/index.js";

/** W3: the challenge code is the one memorable element; open the camera or report an empty spot. */
export function Claimed(props: {
  claim: ClaimResponse;
  onOpenCamera: () => void;
  onOutOfStock: () => void;
  onGiveBack: () => void;
  onExpire: () => void;
  busy: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const { claim, challenge, task } = props.claim;
  return (
    <main className="screen">
      <NavBar
        title={`${task.product}, ${task.store}`}
        action={<Countdown expiresAt={claim.expiresAt} onExpire={props.onExpire} />}
      />
      <section className="code-card" aria-label="Your code">
        <p className="footnote">Your code</p>
        <p className="code-display" translate="no" data-testid="challenge-code">
          {challenge.code}
        </p>
        <p className="body">{challenge.instruction}</p>
      </section>
      <div className="action-bar">
        <Button onClick={props.onOpenCamera}>Open camera</Button>
        <TextButton onClick={props.onOutOfStock}>Product not on the shelf</TextButton>
        {confirming ? (
          <div className="confirm-row" role="group" aria-label="Give the task back?">
            <TextButton destructive disabled={props.busy} onClick={props.onGiveBack}>
              Give back
            </TextButton>
            <TextButton onClick={() => setConfirming(false)}>Keep task</TextButton>
          </div>
        ) : (
          <TextButton onClick={() => setConfirming(true)}>Give task back</TextButton>
        )}
      </div>
    </main>
  );
}
