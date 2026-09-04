const SPACE_X_API_URL = "https://api.spacexdata.com";
const REQUEST_TIMEOUT_MS = 8_000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => {
    timeoutController.abort();
  }, REQUEST_TIMEOUT_MS);

  const abortRequest = () => {
    timeoutController.abort();
  };

  if (signal?.aborted) {
    abortRequest();
  } else {
    signal?.addEventListener("abort", abortRequest, { once: true });
  }

  let response: Response;

  try {
    response = await fetch(`${SPACE_X_API_URL}${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: timeoutController.signal,
    });
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortRequest);
  }

  if (!response.ok) {
    throw new ApiError(
      `SpaceX API request failed with status ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}
