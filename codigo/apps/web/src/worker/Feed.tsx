import { isAppError } from "@shelfie/core/browser";
import type { ClaimLocation, TaskListItem } from "@shelfie/core/browser";
import { useDeps } from "../deps.js";
import { formatAda, minutesLeft, shortAddress } from "../lib/format.js";
import { useTaskFeed } from "../lib/hooks.js";
import { describeError, S } from "../lib/messages.js";
import {
  Banner,
  Button,
  EmptyState,
  Group,
  LargeTitle,
  NavBar,
  Row,
  TextButton,
} from "../ui/index.js";

export type LocationState = "idle" | "reading" | "ok" | "denied" | "unavailable";

/** W1: live task feed. A task leaves the list on `task_closed`; first claim wins. */
export function Feed(props: {
  location: ClaimLocation | undefined;
  locationState: LocationState;
  onRequestLocation: () => void;
  onOpen: (task: TaskListItem) => void;
  address: string | null;
  onEditProfile: () => void;
  notice?: string | undefined;
}) {
  const { now } = useDeps();
  const feed = useTaskFeed(props.location);
  const locationMissing = props.locationState !== "ok";

  return (
    <main className="screen">
      <NavBar
        action={
          <TextButton onClick={props.onEditProfile} translate="no">
            {props.address ? shortAddress(props.address) : "Set payout address"}
          </TextButton>
        }
      />
      <LargeTitle title={S.feedTitle} />
      {props.notice ? (
        <p className="notice" role="status">
          {props.notice}
        </p>
      ) : null}

      {locationMissing ? (
        <EmptyState
          text={
            props.locationState === "denied"
              ? "Location is blocked. Allow it in the browser settings, then try again."
              : S.locationOff
          }
          help="It is only used to check the city (about 1 km)."
          action={
            <Button onClick={props.onRequestLocation} disabled={props.locationState === "reading"}>
              {props.locationState === "reading" ? "Getting location…" : "Allow location"}
            </Button>
          }
        />
      ) : (
        <>
          {feed.status === "reconnecting" ? (
            <Banner tone="warning" title="Reconnecting.">
              The list refreshes every few seconds meanwhile.
            </Banner>
          ) : null}
          {feed.error && isAppError(feed.error) ? (
            <p className="error-text" role="alert">
              {describeError(feed.error)}
            </p>
          ) : null}
          {feed.pendingCount > 0 ? (
            <button type="button" className="new-pill" onClick={feed.flush}>
              {feed.pendingCount === 1 ? "1 new task" : `${feed.pendingCount} new tasks`}
            </button>
          ) : null}
          {feed.rows.length === 0 && !feed.loading ? (
            <EmptyState text={S.feedEmpty} />
          ) : (
            <Group label="Open tasks" footer={S.feedHint}>
              {feed.rows.map(({ task, leaving }) => (
                <Row
                  key={task.id}
                  className={leaving ? "leaving" : ""}
                  title={task.productName}
                  secondary={`${task.storeName}, ${task.storeAddress}`}
                  trailing={formatAda(task.payoutAmount)}
                  trailingSecondary={`${minutesLeft(task.windowEndsAt, now())} min left`}
                  {...(leaving ? {} : { onClick: () => props.onOpen(task) })}
                />
              ))}
            </Group>
          )}
        </>
      )}
    </main>
  );
}
