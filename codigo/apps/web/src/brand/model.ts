import type { OrderView } from "@shelfie/core/browser";

// Pure helpers for the brand app (/b). Everything here works on the brand's own orders only:
// the engine already scopes GET /api/orders to the signed-in brand (ADR-21).

export type OrderRow = OrderView["jobs"][number];

/** Order job statuses that mean a result was delivered (escrow settled or settling). */
const DELIVERED: readonly string[] = ["DELIVERED", "SETTLED"];
/** Order job statuses that mean no result will be delivered (escrow refunded or withheld). */
const REFUNDED: readonly string[] = ["WITHHELD", "REFUNDED"];

export interface BrandCounts {
  /** Shelf requests (orders). */
  requests: number;
  /** Store rows across all requests: one shelf check per store. */
  stores: number;
  delivered: number;
  refunded: number;
}

/** Four counts over the brand's orders, derived from the order job statuses. */
export function brandCounts(orders: readonly OrderView[]): BrandCounts {
  const rows = orders.flatMap((o) => o.jobs);
  return {
    requests: orders.length,
    stores: rows.length,
    delivered: rows.filter((r) => DELIVERED.includes(r.status)).length,
    refunded: rows.filter((r) => REFUNDED.includes(r.status)).length,
  };
}

export interface RecentRow {
  orderId: string;
  productEan: string;
  storeId: string;
  jobId: string | null;
  status: OrderRow["status"];
  createdAt: string;
}

/** Newest store rows first (orders arrive newest first; rows keep their order). */
export function recentRows(orders: readonly OrderView[], limit: number): RecentRow[] {
  const out: RecentRow[] = [];
  for (const order of orders) {
    for (const row of order.jobs) {
      out.push({
        orderId: order.orderId,
        productEan: order.productEan,
        storeId: row.storeId,
        jobId: row.jobId,
        status: row.status,
        createdAt: order.createdAt,
      });
    }
  }
  return out.slice(0, limit);
}

/** A job may be opened from the brand app only when one of the brand's orders owns it. */
export function jobBelongsTo(orders: readonly OrderView[], jobId: string): boolean {
  return orders.some((o) => o.jobs.some((r) => r.jobId === jobId));
}
