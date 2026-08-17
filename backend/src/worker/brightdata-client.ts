import "dotenv/config";

const TRIGGER_URL = "https://api.brightdata.com/dca/trigger";
const DATASET_URL = "https://api.brightdata.com/dca/dataset";
const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 5 * 60_000;

function authHeader(): Record<string, string> {
  const token = process.env.BRIGHT_DATA_API_TOKEN;
  if (!token) {
    throw new Error("BRIGHT_DATA_API_TOKEN is not set — see .env.example");
  }
  return { Authorization: `Bearer ${token}` };
}

export interface TriggerInput {
  url: string;
  zip_code?: string;
  [key: string]: unknown;
}

export async function triggerCollection(
  collectorId: string,
  inputs: TriggerInput[],
): Promise<string> {
  const res = await fetch(
    `${TRIGGER_URL}?collector=${encodeURIComponent(collectorId)}&queue_next=1`,
    {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    },
  );
  if (!res.ok) {
    throw new Error(`trigger failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { collection_id: string };
  return body.collection_id;
}

export type CollectorRow = Record<string, unknown>;

/** Polls until the dataset is a non-empty array, or throws after POLL_TIMEOUT_MS. */
export async function pollDataset(collectionId: string): Promise<CollectorRow[]> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await fetch(`${DATASET_URL}?id=${encodeURIComponent(collectionId)}`, {
      headers: authHeader(),
    });
    if (!res.ok) {
      throw new Error(`dataset poll failed: ${res.status} ${await res.text()}`);
    }
    const body = await res.json();
    if (Array.isArray(body) && body.length > 0) {
      return body as CollectorRow[];
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`dataset ${collectionId} did not complete within ${POLL_TIMEOUT_MS}ms`);
}
