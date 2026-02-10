export function buildClientResponseHeaders(upstreamHeaders: Headers): Headers {
  const responseHeaders = new Headers();
  const allowlist = ["content-type", "content-length", "cache-control", "etag", "last-modified", "vary"];
  for (const header of allowlist) {
    const value = upstreamHeaders.get(header);
    if (value) {
      responseHeaders.set(header, value);
    }
  }
  return responseHeaders;
}

