const ACCESS_TOKEN_KEY = "delcom_access_token";

export type ApiQuery = Record<string, string | number | boolean | null | undefined>;

export interface ApiResponse<T = undefined> {
  status: "success" | "fail" | "error";
  message: string;
  data: T;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: ApiQuery;
  body?: unknown;
  /** Sertakan header Bearer Token. Default: true */
  auth?: boolean;
}

/** Error terstandarisasi untuk semua kegagalan request. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: Record<string, string[]>;

  constructor(message: string, statusCode = 0, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/* ---------- Penyimpanan token ---------- */

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/* ---------- Utilitas internal ---------- */

function buildUrl(path: string, query?: ApiQuery): string {
  const base = DELCOM_BASEURL.replace(/\/+$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

function extractErrors(data: unknown): Record<string, string[]> {
  return data !== null && typeof data === "object" ? (data as Record<string, string[]>) : {};
}

/* ---------- Wrapper fetch utama ---------- */

export async function apiRequest<T = undefined>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", query, body, auth = true } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = auth ? getAccessToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
  }

  let payload: ApiResponse<T> | null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  // Token tidak valid/kedaluwarsa: bersihkan agar pengguna diarahkan login ulang
  if (response.status === 401) removeAccessToken();

  if (!response.ok || !payload || payload.status !== "success") {
    throw new ApiError(
      payload?.message ?? `Permintaan gagal (${response.status})`,
      response.status,
      extractErrors(payload?.data),
    );
  }

  return payload;
}

/* ---------- Pintasan per method ---------- */

export const apiGet = <T = undefined>(path: string, query?: ApiQuery, auth = true) =>
  apiRequest<T>(path, { method: "GET", query, auth });

export const apiPost = <T = undefined>(path: string, body?: unknown, auth = true) =>
  apiRequest<T>(path, { method: "POST", body, auth });

export const apiPut = <T = undefined>(path: string, body?: unknown, auth = true) =>
  apiRequest<T>(path, { method: "PUT", body, auth });

export const apiDelete = <T = undefined>(path: string, auth = true) =>
  apiRequest<T>(path, { method: "DELETE", auth });