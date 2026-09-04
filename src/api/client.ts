const SPACE_X_API_URL = "https://api.spacexdata.com";

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
  const response = await fetch(`${SPACE_X_API_URL}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new ApiError(
      `SpaceX API request failed with status ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}
