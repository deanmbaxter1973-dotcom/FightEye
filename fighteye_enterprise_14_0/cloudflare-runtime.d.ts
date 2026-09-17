interface D1Database {
  prepare(query: string): unknown;
}

interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | Blob | string,
    options?: unknown,
  ): Promise<unknown>;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
