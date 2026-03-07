export const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

type ApiError = { message?: string } | string;

async function parseError(res: Response): Promise<string> {
  try {
    const data: ApiError = await res.json();
    if (typeof data === "string") return data;
    return data?.message ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function apiFetch<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}
