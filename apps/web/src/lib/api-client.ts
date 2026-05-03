import { clearStoredSession } from "@/lib/auth-session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
}

export class ApiClientError extends Error {
  status: number;
  code?: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

function normalizeBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === "string" || body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
    return body;
  }

  return JSON.stringify(body);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, body, ...rest } = options;
  const normalizedBody = normalizeBody(body);
  const response = await fetch(`${API_BASE_URL}/api/v1/${path}`, {
    ...rest,
    body: normalizedBody,
    headers: {
      ...(normalizedBody && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {})
    }
  });

  let payload: ApiEnvelope<T> | null = null;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredSession();
    }

    throw new ApiClientError(payload?.message ?? `Request failed: ${response.status}`, response.status, payload?.code);
  }

  if (!payload) {
    throw new ApiClientError("Response payload is empty", response.status);
  }

  if (payload.code !== 0) {
    throw new ApiClientError(payload.message || "Request failed", response.status, payload.code);
  }

  return payload.data;
}
