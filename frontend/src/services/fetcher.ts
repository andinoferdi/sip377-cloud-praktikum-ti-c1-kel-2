import { ApiError } from '@/lib/errors';

type FetcherOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | null;
  json?: unknown;
};

export async function fetcher<T>(url: string, options: FetcherOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  let body = options.body;

  if (options.json !== undefined) {
    body = JSON.stringify(options.json);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      body,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request gagal';
    throw new ApiError(message, 0);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    let message = 'Request gagal';

    try {
      if (isJson) {
        const payload = (await response.json()) as { message?: string };
        message = payload.message ?? message;
      } else {
        const text = await response.text();
        if (text) {
          message = text;
        }
      }
    } catch {
      message = 'Request gagal';
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (isJson) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}
