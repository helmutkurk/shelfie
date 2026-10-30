import { useCallback, useEffect, useState } from "react";
import type { ClaimLocation, ClaimResponse, Outcome, TaskListItem } from "@shelfie/core/browser";
import { useDeps } from "../deps.js";
import { DEFAULT_EXPLORER_TX_BASE } from "../lib/format.js";
import { readCoarseLocation } from "../lib/geo.js";
import { describeError, S } from "../lib/messages.js";
import {
  clearConsent,
  hasConsent,
  loadProfile,
  locationHint,
  saveConsent,
  saveLocationHint,
  saveProfile,
} from "../lib/storage.js";
import type { Profile } from "../lib/storage.js";
import { ExplorerProvider, Toast } from "../ui/index.js";
import { CameraSheet } from "./CameraSheet.js";
import type { SubmittedInfo } from "./CameraSheet.js";
import { Claimed } from "./Claimed.js";
import { Feed } from "./Feed.js";
import type { LocationState } from "./Feed.js";
import { Onboarding } from "./Onboarding.js";
import { Result } from "./Result.js";
import { TaskDetail } from "./TaskDetail.js";

type Screen =
  | { name: "onboarding" }
  | { name: "feed" }
  | { name: "detail"; task: TaskListItem }
  | { name: "claimed"; task: TaskListItem; claim: ClaimResponse }
  | { name: "result"; task: TaskListItem; info: SubmittedInfo };

/** Worker app (`/w`): onboarding, live feed, claim, camera sheet, verdict and payout. */
export function WorkerApp() {
  const deps = useDeps();
  const { api, storage } = deps;

  const [profile, setProfile] = useState<Profile | null>(() => loadProfile(storage));
  const [consented, setConsented] = useState(() => hasConsent(storage, S.consentVersion));
  const [screen, setScreen] = useState<Screen>(() =>
    loadProfile(storage) && hasConsent(storage, S.consentVersion)
      ? { name: "feed" }
      : { name: "onboarding" },
  );
  const [toast, setToast] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | undefined>(undefined);
  const [explorerBase, setExplorerBase] = useState(DEFAULT_EXPLORER_TX_BASE);
  const [camera, setCamera] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);

  // Location (coarse) for the city feed; asked on a user gesture, or silently if allowed before.
  const [location, setLocation] = useState<ClaimLocation | undefined>(undefined);
  const [locState, setLocState] = useState<LocationState>("idle");
  const requestLocation = useCallback(() => {
    setLocState("reading");
    readCoarseLocation(deps.geolocation)
      .then((loc) => {
        setLocation(loc);
        setLocState("ok");
        saveLocationHint(storage);
      })
      .catch((err: unknown) => {
        setLocState(
          err instanceof Error && "kind" in err && err.kind === "denied" ? "denied" : "unavailable",
        );
      });
  }, [deps.geolocation, storage]);
  useEffect(() => {
    if (locationHint(storage)) requestLocation();
  }, [storage, requestLocation]);

  // Pack labels / explorer base. Failure is not fatal.
  useEffect(() => {
    const controller = new AbortController();
    api
      .config(controller.signal)
      .then((cfg) => setExplorerBase(cfg.explorerTxBase))
      .catch(() => undefined);
    return () => controller.abort();
  }, [api]);

  const toFeed = useCallback((message?: string) => {
    setCamera(null);
    setScreen({ name: "feed" });
    setNotice(undefined);
    if (message) setToast(message);
  }, []);

  const giveBack = async (claim: ClaimResponse) => {
    setBusy(true);
    try {
      await api.release(claim.claim.id);
      toFeed("Task given back");
    } catch (err) {
      setToast(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  let body;
  switch (screen.name) {
    case "onboarding":
      body = (
        <Onboarding
          initial={profile}
          consented={consented}
          onSave={(p) => {
            saveProfile(storage, p);
            saveConsent(storage, S.consentVersion);
            setProfile(p);
            setConsented(true);
            setScreen({ name: "feed" });
          }}
          onDecline={() => {
            clearConsent(storage);
            setConsented(false);
            setScreen({ name: "feed" });
          }}
        />
      );
      break;
    case "feed":
      body = (
        <Feed
          location={location}
          locationState={locState}
          onRequestLocation={requestLocation}
          onOpen={(task) => setScreen({ name: "detail", task })}
          address={profile?.address ?? null}
          onEditProfile={() => setScreen({ name: "onboarding" })}
          notice={notice}
        />
      );
      break;
    case "detail":
      body = (
        <TaskDetail
          task={screen.task}
          profile={profile}
          canClaim={consented}
          onBack={() => toFeed()}
          onNeedProfile={() => setScreen({ name: "onboarding" })}
          onClaimed={(claim) => setScreen({ name: "claimed", task: screen.task, claim })}
          onTooSlow={() => {
            setScreen({ name: "feed" });
            setNotice(S.tooSlow);
          }}
        />
      );
      break;
    case "claimed":
      body = (
        <>
          <Claimed
            claim={screen.claim}
            busy={busy}
            onOpenCamera={() => setCamera("OBSERVED")}
            onOutOfStock={() => setCamera("OUT_OF_STOCK")}
            onGiveBack={() => void giveBack(screen.claim)}
            onExpire={() => {
              setCamera(null);
              setScreen({ name: "detail", task: screen.task });
              setToast("Claim expired, take the task again.");
            }}
          />
          <CameraSheet
            open={camera !== null}
            mode={camera ?? "OBSERVED"}
            onModeChange={setCamera}
            claim={screen.claim}
            task={screen.task}
            onClose={() => setCamera(null)}
            onSubmitted={(info) => {
              setCamera(null);
              setScreen({ name: "result", task: screen.task, info });
            }}
            onClaimLost={() => {
              setCamera(null);
              setScreen({ name: "detail", task: screen.task });
              setToast("Claim expired, take the task again.");
            }}
          />
        </>
      );
      break;
    case "result":
      body = (
        <Result
          submissionId={screen.info.submissionId}
          queuePosition={screen.info.queuePosition}
          payoutAmount={screen.task.payoutAmount}
          onNext={() => toFeed()}
          onRetry={() => setScreen({ name: "detail", task: screen.task })}
        />
      );
      break;
  }

  return (
    <ExplorerProvider value={explorerBase}>
      <div className="worker-stage">
        <div className="app app-worker">{body}</div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </ExplorerProvider>
  );
}
