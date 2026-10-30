import { useEffect, useState } from "react";
import { shortAddress } from "../lib/format.js";
import { ConnectionStatus, Icon, Wordmark } from "../ui/index.js";

/**
 * Worker app header: wordmark, connection status and the payout address chip.
 * The chip copies the full address; the user button opens the profile.
 */
export function AppHeader(props: {
  address: string | null;
  onEditProfile: () => void;
  status?: "connecting" | "open" | "reconnecting" | "closed" | undefined;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);
  const copy = () => {
    if (!props.address) return;
    void navigator.clipboard
      ?.writeText(props.address)
      .then(() => setCopied(true))
      .catch(() => undefined);
  };
  return (
    <header className="app-header">
      <div className="app-header-row">
        <Wordmark />
        {props.status ? <ConnectionStatus status={props.status} /> : null}
      </div>
      <div className="app-header-row">
        {props.address ? (
          <button
            type="button"
            className="chip"
            onClick={copy}
            aria-label={`Copy payout address ${shortAddress(props.address)}`}
          >
            <span className="chip-label">Payout</span>
            <code translate="no">{shortAddress(props.address)}</code>
            <span className="chip-action">
              {copied ? <Icon name="check" size={16} /> : <Icon name="copy" size={16} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </span>
          </button>
        ) : (
          <button type="button" className="chip chip-warn" onClick={props.onEditProfile}>
            Set payout address
          </button>
        )}
        <button
          type="button"
          className="icon-button"
          onClick={props.onEditProfile}
          aria-label="Edit profile and payout address"
        >
          <Icon name="user" />
        </button>
      </div>
    </header>
  );
}
