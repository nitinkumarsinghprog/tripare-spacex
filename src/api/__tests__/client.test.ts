import { apiGet } from "../client";

describe("apiGet", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.useRealTimers();
  });

  it("aborts a request that exceeds the timeout", async () => {
    jest.useFakeTimers();

    globalThis.fetch = jest.fn((_, options?: RequestInit) => {
      return new Promise((_, reject) => {
        options?.signal?.addEventListener("abort", () => {
          reject(new Error("Request aborted"));
        });
      });
    }) as jest.Mock;

    const request = apiGet("/slow-endpoint");
    const assertion = expect(request).rejects.toThrow("Request aborted");

    await jest.advanceTimersByTimeAsync(8_000);

    await assertion;
  });
});
