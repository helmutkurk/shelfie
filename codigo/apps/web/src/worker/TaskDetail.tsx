import { useState } from "react";
import type { ClaimResponse, TaskListItem } from "@shelfie/core/browser";
import { AppError, WorkerIdSchema, isAppError } from "@shelfie/core/browser";
import { useDeps } from "../deps.js";
import { formatAda } from "../lib/format.js";
import { GeoError, readCoarseLocation } from "../lib/geo.js";
import { describeError } from "../lib/messages.js";
import { loadWorkerId } from "../lib/storage.js";
import type { Profile } from "../lib/storage.js";
import { Button, Group, LargeTitle, NavBar, Row } from "../ui/index.js";

const STEPS = [
  "Find the product",
  "Write the code on paper",
  "Hold it next to the price tag",
  "Take one photo with the in-app camera",
] as const;

/** W2: task detail and "Take this task" (claim). */
export function TaskDetail(props: {
  task: TaskListItem;
  profile: Profile | null;
  canClaim: boolean; // consent given
  onBack: () => void;
  onClaimed: (claim: ClaimResponse) => void;
  onTooSlow: () => void;
  onNeedProfile: () => void;
}) {
  const deps = useDeps();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claim = async () => {
    if (!props.profile) {
      props.onNeedProfile();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const location = await readCoarseLocation(deps.geolocation);
      const workerId = loadWorkerId(deps.storage, deps.newId);
      const res = await deps.api.claim(props.task.id, {
        workerId: WorkerIdSchema.parse(workerId),
        displayName: props.profile.name || undefined,
        payoutAddress: props.profile.address,
        location,
      });
      props.onClaimed(res);
    } catch (err) {
      if (err instanceof GeoError) {
        setError(describeError(new AppError("location_required", "")));
      } else if (isAppError(err) && err.code === "task_not_open") {
        props.onTooSlow();
      } else {
        setError(describeError(err));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="screen">
      <NavBar back={{ label: "Tasks", onClick: props.onBack }} />
      <LargeTitle
        title={props.task.productName}
        subtitle={`${props.task.storeName}, ${props.task.storeAddress}`}
      />
      <Group label="Steps" footer="No product there? You can report the empty shelf spot.">
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </Group>
      <Group label="Reward">
        <Row title="Reward" trailing={formatAda(props.task.payoutAmount)} />
      </Group>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      {!props.canClaim ? (
        <p className="footnote" role="status">
          You are looking around only. Accept the privacy text to take tasks.
        </p>
      ) : null}
      <div className="action-bar">
        <Button disabled={busy || !props.canClaim} onClick={() => void claim()}>
          {busy ? "Taking…" : "Take this task"}
        </Button>
      </div>
    </main>
  );
}
