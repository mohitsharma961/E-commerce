export async function fetchJson(path: string) {
  // Remove trailing slash from env base if present
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/,'') ?? '';

  // Build url: prefer absolute base if present, else use relative path
  const url = base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : (path.startsWith('/') ? path : `/${path}`);

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`fetchJson: non-OK response for ${url} -> ${res.status} ${res.statusText}\n${text}`);
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      console.error(`fetchJson: expected JSON from ${url} but got ${contentType}\n${text}`);
      throw new Error('Invalid JSON response');
    }

    return await res.json();
  } catch (err) {
    console.error(`fetchJson: error fetching ${url}`, err);
    throw err;
  }
}
