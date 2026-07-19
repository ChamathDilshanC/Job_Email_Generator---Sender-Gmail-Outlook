import { load } from 'cheerio';
import dns from 'dns';
import { NextRequest, NextResponse } from 'next/server';

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_REDIRECTS = 5;
const USER_AGENT =
  'Mozilla/5.0 (compatible; JobMailBot/1.0; +https://jobmail.app) AppleWebKit/537.36';

/**
 * Reject loopback/private/link-local IPs so this route can't be used as an
 * SSRF proxy against internal services or cloud metadata endpoints
 * (169.254.169.254, etc). Checked against every DNS-resolved address, not
 * just the hostname string, to defend against DNS-rebinding.
 */
function isDisallowedIp(ip: string): boolean {
  const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [parseInt(v4[1]), parseInt(v4[2])];
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 0) return true; // "this network"
    return false;
  }

  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true; // loopback / unspecified
  if (lower.startsWith('fe80:')) return true; // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local
  const mappedV4 = lower.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (mappedV4) return isDisallowedIp(mappedV4[1]);

  return false;
}

async function assertHostnameIsPublic(hostname: string) {
  if (hostname === 'localhost') {
    throw new Error('Requests to localhost are not allowed');
  }
  const addresses = await dns.promises.lookup(hostname, { all: true });
  for (const { address } of addresses) {
    if (isDisallowedIp(address)) {
      throw new Error('Requests to private/internal addresses are not allowed');
    }
  }
}

async function fetchWithGuards(startUrl: string): Promise<string> {
  let currentUrl = startUrl;

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    const parsed = new URL(currentUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Only http/https URLs are supported');
    }
    await assertHostnameIsPublic(parsed.hostname);

    const response = await fetch(currentUrl, {
      redirect: 'manual',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) throw new Error('Redirect with no Location header');
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch URL (status ${response.status})`);
    }

    const reader = response.body?.getReader();
    if (!reader) return await response.text();

    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const buffer = Buffer.concat(chunks.map(c => Buffer.from(c)));
    return buffer.toString('utf-8');
  }

  throw new Error('Too many redirects');
}

interface ParsedJobInfo {
  position?: string;
  companyName?: string;
  source: 'jsonld' | 'og' | 'title' | 'none';
}

function extractFromJsonLd($: ReturnType<typeof load>): ParsedJobInfo | null {
  const scripts = $('script[type="application/ld+json"]').toArray();

  for (const script of scripts) {
    const raw = $(script).contents().text();
    if (!raw) continue;

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue; // malformed JSON-LD is common, skip and try the next block
    }

    const candidates = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.['@graph'])
        ? parsed['@graph']
        : [parsed];

    for (const candidate of candidates) {
      const type = candidate?.['@type'];
      const isJobPosting = Array.isArray(type)
        ? type.includes('JobPosting')
        : type === 'JobPosting';
      if (!isJobPosting) continue;

      const position = typeof candidate.title === 'string' ? candidate.title : undefined;
      const org = candidate.hiringOrganization;
      const companyName =
        typeof org === 'string' ? org : typeof org?.name === 'string' ? org.name : undefined;

      if (position || companyName) {
        return { position, companyName, source: 'jsonld' };
      }
    }
  }

  return null;
}

function extractFromOpenGraph($: ReturnType<typeof load>): ParsedJobInfo | null {
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const siteName = $('meta[property="og:site_name"]').attr('content');

  if (ogTitle || siteName) {
    return { position: ogTitle, companyName: siteName, source: 'og' };
  }
  return null;
}

function extractFromTitle($: ReturnType<typeof load>): ParsedJobInfo | null {
  const title = $('title').first().text().trim();
  if (!title) return null;

  const separators = [' at ', ' - ', ' | '];
  for (const sep of separators) {
    if (title.includes(sep)) {
      const [position, companyName] = title.split(sep);
      return {
        position: position?.trim(),
        companyName: companyName?.trim(),
        source: 'title',
      };
    }
  }
  return { position: title, source: 'title' };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'A job URL is required' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'That does not look like a valid URL' }, { status: 400 });
    }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only http/https URLs are supported' }, { status: 400 });
    }

    const html = await fetchWithGuards(url);
    const $ = load(html);

    const result: ParsedJobInfo =
      extractFromJsonLd($) ||
      extractFromOpenGraph($) ||
      extractFromTitle($) || { source: 'none' };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error parsing job URL:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Could not read that job URL. Please enter details manually.',
        source: 'none',
      },
      { status: 422 }
    );
  }
}
