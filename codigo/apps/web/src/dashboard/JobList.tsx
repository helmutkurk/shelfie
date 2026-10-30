import { useState } from "react";
import type { CatalogResponse, JobView } from "@shelfie/core/browser";
import { formatTime } from "../lib/format.js";
import { EmptyState, Group, LargeTitle, Pill, Row, Segmented, TextButton } from "../ui/index.js";
import { describeJob, jobStatus, matchesFilter } from "./model.js";
import type { JobFilter } from "./model.js";

/** B2: job list with live counts. */
export function JobList(props: {
  jobs: JobView[] | undefined;
  catalog: CatalogResponse | undefined;
  selectedId: string | null;
  onOpen: (id: string) => void;
  onNew: () => void;
}) {
  const [filter, setFilter] = useState<JobFilter>("all");
  const jobs = (props.jobs ?? []).filter((j) => matchesFilter(j.job.state, filter));
  return (
    <section className="screen" aria-label="Requests">
      <LargeTitle title="Requests" />
      <Segmented<JobFilter>
        label="Filter requests"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "done", label: "Done" },
        ]}
      />
      {jobs.length === 0 ? (
        <EmptyState
          text="No requests yet. Create one to see it here."
          action={<TextButton onClick={props.onNew}>New shelf check</TextButton>}
        />
      ) : (
        <Group label="Requests">
          {jobs.map((view) => {
            const { title, subtitle } = describeJob(view, props.catalog);
            const status = jobStatus(view.job.state);
            return (
              <Row
                key={view.job.id}
                className={props.selectedId === view.job.id ? "selected" : ""}
                title={title}
                secondary={`${subtitle}. Passed ${view.counts.passed} of ${view.job.k}, open ${view.counts.open}, failed ${view.counts.failed}.`}
                trailing={<Pill tone={status.tone}>{status.label}</Pill>}
                trailingSecondary={formatTime(view.job.createdAt)}
                onClick={() => props.onOpen(view.job.id)}
              />
            );
          })}
        </Group>
      )}
    </section>
  );
}
