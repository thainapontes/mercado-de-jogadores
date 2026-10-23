const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api/v1`;

const CONNECTION_ERROR_MESSAGE =
  'Não foi possível conectar à API. Verifique se o backend está no ar.';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type QueryParams = Record<string, string | number | undefined>;

interface RequestOptions {
  body?: unknown;
  params?: QueryParams;
}

export function buildUrl(path: string, params: QueryParams = {}): string {
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(name, String(value));
    }
  }
  const query = search.toString();
  return `${API_BASE_URL}${path}${query ? `?${query}` : ''}`;
}

async function send(
  method: string,
  path: string,
  { body, params }: RequestOptions,
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers:
        body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, CONNECTION_ERROR_MESSAGE);
  }
  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }
  return response;
}

async function readErrorMessage(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    typeof payload.message === 'string' &&
    payload.message !== ''
  ) {
    return payload.message;
  }
  return `A API respondeu com o erro ${response.status}.`;
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await send(method, path, options);
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, params?: QueryParams) =>
    request<T>('GET', path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, { body }),
  patch: <T>(path: string, body: unknown) =>
    request<T>('PATCH', path, { body }),
  delete: (path: string) => request<void>('DELETE', path),
  getBlob: async (path: string, params?: QueryParams) =>
    (await send('GET', path, { params })).blob(),
};
