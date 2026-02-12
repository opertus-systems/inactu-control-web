import { createControlApiToken } from "./control-api-auth";
import { requireProvenactApiBaseUrl } from "./provenact-api-base-url";

const DEFAULT_CONTROL_API_TIMEOUT_MS = 10_000;

function controlApiBaseUrl(): string {
  return requireProvenactApiBaseUrl(process.env.PROVENACT_API_BASE_URL);
}

function controlApiTimeoutMs(): number {
  const raw = Number(process.env.PROVENACT_API_TIMEOUT_MS);
  if (!Number.isFinite(raw) || raw <= 0) {
    return DEFAULT_CONTROL_API_TIMEOUT_MS;
  }
  return Math.min(Math.floor(raw), 60_000);
}

export async function controlApiFetch(path: string, userId: string, init?: RequestInit): Promise<Response> {
  try {
    const token = await createControlApiToken(userId);
    const headers = new Headers(init?.headers);
    headers.set("authorization", `Bearer ${token}`);
    if (!headers.has("content-type") && init?.body) {
      headers.set("content-type", "application/json");
    }

    return await fetch(`${controlApiBaseUrl()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(controlApiTimeoutMs())
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "network error";
    const status = message.includes("PROVENACT_") ? 500 : 502;
    return Response.json(
      { error: `Control API request failed: ${message}` },
      { status }
    );
  }
}
