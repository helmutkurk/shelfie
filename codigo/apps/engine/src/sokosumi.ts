import { AppError, CreateJobResponseSchema } from "@shelfie/core";
import type { EngineEnv, IdGenerator } from "@shelfie/core";
import { z } from "zod";
import type { Engine } from "./engine.js";

export interface SokosumiTaskInput {
  orderId: string;
  storeId: string;
  productEan: string;
  maxCredits: number;
}
export interface SokosumiClient {
  createTask(
    input: SokosumiTaskInput,
    onCreated?: (taskId: string) => void,
  ): Promise<{ taskId: string }>;
}

/** Local rehearsal only: same createJob method/body as the authenticated shell bridge. */
export class FakeSokosumiClient implements SokosumiClient {
  constructor(
    private readonly engine: Engine,
    private readonly env: EngineEnv,
    private readonly ids: IdGenerator,
  ) {}
  createTask(
    input: SokosumiTaskInput,
    onCreated?: (taskId: string) => void,
  ): Promise<{ taskId: string }> {
    const taskId = `fake-sokosumi-${input.orderId}-${this.ids.next("tsk")}`;
    onCreated?.(taskId);
    CreateJobResponseSchema.parse(
      this.engine.createJob(
        {
          packId: this.env.PACK_ID,
          source: "shell",
          externalRef: taskId,
          input: { productEan: input.productEan, stores: [{ id: input.storeId }] },
          orderRef: { orderId: input.orderId, storeId: input.storeId },
        },
        "shell",
      ).body,
    );
    return Promise.resolve({ taskId });
  }
}

const unavailable = () =>
  new AppError("sokosumi_unavailable", "Sokosumi request could not be confirmed.");
const SchemaResponse = z.object({ data: z.record(z.string(), z.unknown()) });

/**
 * B-15 blocks real purchases: the runbook confirms agent jobs, but the starter consumes coworker
 * Tasks. A READY Task plus an attached agent job can buy twice. Never guess that authority/link.
 * The real adapter performs a read-only authenticated probe, with no automatic retries.
 */
export class RealSokosumiClient implements SokosumiClient {
  constructor(
    private readonly env: EngineEnv,
    private readonly fetchFn: typeof fetch = fetch,
  ) {
    if (
      env.SOKOSUMI_API_URL !== "https://api.preprod.sokosumi.com" ||
      !env.SOKOSUMI_API_TOKEN ||
      !env.SOKOSUMI_AGENT_ID
    ) {
      throw new AppError("internal", "Real Sokosumi configuration is incomplete.");
    }
  }

  async createTask(_input: SokosumiTaskInput): Promise<{ taskId: string }> {
    try {
      const response = await this.fetchFn(
        new URL(
          `/v1/agents/${encodeURIComponent(this.env.SOKOSUMI_AGENT_ID!)}/input-schema`,
          this.env.SOKOSUMI_API_URL,
        ),
        {
          method: "GET",
          redirect: "error",
          signal: AbortSignal.timeout(10_000),
          headers: {
            Authorization: `Bearer ${this.env.SOKOSUMI_API_TOKEN}`,
            Accept: "application/json",
          },
        },
      );
      if (!response.ok || !response.body) throw unavailable();
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;
          const bytes: unknown = chunk.value;
          if (!(bytes instanceof Uint8Array)) throw unavailable();
          size += bytes.byteLength;
          if (size > 64_000) throw unavailable();
          chunks.push(bytes);
        }
      } finally {
        await reader.cancel().catch(() => undefined);
      }
      SchemaResponse.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    } catch {
      // Neither upstream response nor thrown error is safe to expose (may contain credentials).
      throw unavailable();
    }
    // verify Friday (B-15): capped coworker Task create body, account/workspace authority,
    // exactly one paid mechanism, response Task id and its actual starter journal identity.
    throw new AppError(
      "sokosumi_unavailable",
      "Real Task purchases are blocked pending the B-15 capped REST spike.",
    );
  }
}
