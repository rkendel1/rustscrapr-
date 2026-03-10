import { NextResponse } from 'next/server';
import puppeteer, { Browser, Page } from 'puppeteer';
import type { StartupEntry, StartupsRipResult } from '@/types';

const PAGE_LOAD_TIMEOUT_MS = 60_000;
const BODY_WAIT_TIMEOUT_MS = 10_000;
const RENDER_DELAY_MS = 2_000; // allow dynamic content to render

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-Dest': 'document',
  'Cache-Control': 'max-age=0',
  'Upgrade-Insecure-Requests': '1',
};

async function createBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
}

async function navigatePage(page: Page, url: string): Promise<void> {
  await page.setExtraHTTPHeaders(BROWSER_HEADERS);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_LOAD_TIMEOUT_MS });
  } catch {
    await page.goto(url, { waitUntil: 'load', timeout: PAGE_LOAD_TIMEOUT_MS });
  }
  await page.waitForSelector('body', { timeout: BODY_WAIT_TIMEOUT_MS }).catch(() => {});
  // Allow dynamic content to render
  await new Promise((r) => setTimeout(r, RENDER_DELAY_MS));
}

/**
 * Extracts all startup cards/entries from the current page using
 * broad selectors to handle various layout patterns on startups.rip.
 */
async function extractStartupsFromPage(
  page: Page,
  pageUrl: string
): Promise<StartupEntry[]> {
  return page.evaluate((sourceUrl: string) => {
    const entries: StartupEntry[] = [];

    // Helper to clean whitespace from text
    const clean = (s: string | null | undefined): string | null => {
      if (!s) return null;
      const t = s.trim().replace(/\s+/g, ' ');
      return t || null;
    };

    // Common card/article/list-item selectors used on modern startup directories
    const candidateSelectors = [
      'article',
      '[class*="startup"]',
      '[class*="company"]',
      '[class*="card"]',
      'li[class]',
      '[class*="item"]',
      '[class*="entry"]',
      '[class*="post"]',
    ];

    let cards: Element[] = [];
    for (const sel of candidateSelectors) {
      const found = Array.from(document.querySelectorAll(sel));
      // Filter: must contain a link and some text, and have reasonable size
      const valid = found.filter((el) => {
        const hasLink = el.querySelector('a') !== null;
        const text = el.textContent?.trim() || '';
        return hasLink && text.length > 10 && text.length < 5000;
      });
      if (valid.length > cards.length) {
        cards = valid;
      }
    }

    // Fallback: try rows in a table
    if (cards.length === 0) {
      const rows = Array.from(document.querySelectorAll('table tr')).filter(
        (r) => r.querySelector('a') !== null
      );
      if (rows.length > 0) cards = rows;
    }

    // Deduplicate by href to avoid nested duplicates
    const seen = new Set<string>();

    for (const card of cards) {
      const linkEl = card.querySelector('a[href]') as HTMLAnchorElement | null;
      const href = linkEl?.href || null;

      // Skip header/nav rows without meaningful hrefs
      if (!href || href === sourceUrl || href === window.location.origin + '/') {
        continue;
      }
      if (seen.has(href)) continue;
      seen.add(href);

      // Extract name from heading or first link text
      const headingEl = card.querySelector('h1,h2,h3,h4,h5,h6');
      const name =
        clean(headingEl?.textContent) ||
        clean(linkEl?.textContent) ||
        clean(card.querySelector('[class*="name"],[class*="title"]')?.textContent) ||
        'Unknown';

      // Extract description
      const descEl = card.querySelector(
        'p,[class*="desc"],[class*="summary"],[class*="excerpt"],[class*="blurb"]'
      );
      const description = clean(descEl?.textContent) || null;

      // Extract funding amount
      const fundingEl = card.querySelector(
        '[class*="fund"],[class*="raised"],[class*="amount"],[class*="money"]'
      );
      let totalFunding = clean(fundingEl?.textContent) || null;
      if (!totalFunding) {
        // Search text for funding patterns like "$1.2M raised"
        const text = card.textContent || '';
        const match = text.match(/\$[\d,.]+[KMBkm]?(?:\s*(?:million|billion|raised))?/i);
        if (match) totalFunding = match[0].trim();
      }

      // Extract dates
      const dateEl = card.querySelector(
        '[class*="date"],[class*="shut"],[class*="closed"],[class*="died"],[class*="founded"]'
      );
      let shutdownDate = clean(dateEl?.textContent) || null;
      let foundedYear: string | null = null;
      if (!shutdownDate) {
        const text = card.textContent || '';
        const yearMatch = text.match(/\b(19|20)\d{2}\b/g);
        if (yearMatch && yearMatch.length >= 2) {
          foundedYear = yearMatch[0];
          shutdownDate = yearMatch[yearMatch.length - 1];
        } else if (yearMatch && yearMatch.length === 1) {
          shutdownDate = yearMatch[0];
        }
      }

      // Extract industry / tags
      const tagEls = Array.from(
        card.querySelectorAll('[class*="tag"],[class*="category"],[class*="label"],[class*="badge"]')
      );
      const tags = tagEls.map((t) => clean(t.textContent)).filter(Boolean) as string[];

      // Extract industry from tags or dedicated field
      const industryEl = card.querySelector('[class*="industry"],[class*="sector"],[class*="type"]');
      const industry =
        clean(industryEl?.textContent) ||
        (tags.length > 0 ? tags[0] : null);

      // Extract location
      const locationEl = card.querySelector(
        '[class*="location"],[class*="city"],[class*="country"],[class*="region"]'
      );
      const location = clean(locationEl?.textContent) || null;

      // Extract employee count
      const empEl = card.querySelector(
        '[class*="employee"],[class*="team"],[class*="size"],[class*="head"]'
      );
      let employeeCount = clean(empEl?.textContent) || null;
      if (!employeeCount) {
        const text = card.textContent || '';
        const empMatch = text.match(/\b(\d+)\s*(?:employees|team members|people|staff)\b/i);
        if (empMatch) employeeCount = empMatch[1];
      }

      // Extract reason for shutdown
      const reasonEl = card.querySelector(
        '[class*="reason"],[class*="why"],[class*="cause"],[class*="story"]'
      );
      const reasonForShutdown = clean(reasonEl?.textContent) || null;

      // Compute slug from href
      let slug: string | null = null;
      try {
        const u = new URL(href);
        slug = u.pathname.replace(/^\/+|\/+$/g, '') || null;
      } catch {
        slug = null;
      }

      entries.push({
        name,
        url: href,
        slug,
        description,
        foundedYear,
        shutdownDate,
        totalFunding,
        industry,
        location,
        employeeCount,
        reasonForShutdown,
        tags,
        sourceUrl,
      });
    }

    return entries;
  }, pageUrl);
}

/**
 * Scrapes the detail page for a startup entry to enrich data.
 */
async function scrapeDetailPage(
  page: Page,
  entry: StartupEntry
): Promise<Partial<StartupEntry>> {
  if (!entry.url) return {};

  try {
    await navigatePage(page, entry.url);

    return page.evaluate(() => {
      const clean = (s: string | null | undefined): string | null => {
        if (!s) return null;
        const t = s.trim().replace(/\s+/g, ' ');
        return t || null;
      };

      // Try to extract description from the full page body text
      const descEl = document.querySelector(
        '[class*="desc"],[class*="summary"],[class*="about"],[class*="story"],main p,article p'
      );
      const description = clean(descEl?.textContent) || null;

      const reasonEl = document.querySelector(
        '[class*="reason"],[class*="why"],[class*="cause"],[class*="shut"]'
      );
      const reasonForShutdown = clean(reasonEl?.textContent) || null;

      const fundingEl = document.querySelector(
        '[class*="fund"],[class*="raised"],[class*="amount"]'
      );
      let totalFunding = clean(fundingEl?.textContent) || null;
      if (!totalFunding) {
        const text = document.body?.textContent || '';
        const match = text.match(/\$[\d,.]+[KMBkm]?(?:\s*(?:million|billion|raised))?/i);
        if (match) totalFunding = match[0].trim();
      }

      const foundedEl = document.querySelector('[class*="found"],[class*="start"],[class*="launch"]');
      const foundedYear = clean(foundedEl?.textContent) || null;

      const shutdownEl = document.querySelector(
        '[class*="shut"],[class*="clos"],[class*="end"],[class*="died"]'
      );
      const shutdownDate = clean(shutdownEl?.textContent) || null;

      const locationEl = document.querySelector('[class*="location"],[class*="city"],[class*="country"]');
      const location = clean(locationEl?.textContent) || null;

      const tagEls = Array.from(
        document.querySelectorAll('[class*="tag"],[class*="category"],[class*="badge"]')
      );
      const tags = tagEls.map((t) => clean(t.textContent)).filter(Boolean) as string[];

      return {
        description,
        reasonForShutdown,
        totalFunding,
        foundedYear,
        shutdownDate,
        location,
        tags,
      };
    });
  } catch {
    return {};
  }
}

/**
 * Finds the URL of the next page, if any.
 */
async function findNextPageUrl(page: Page, currentUrl: string): Promise<string | null> {
  return page.evaluate((current: string) => {
    // Look for next-page links
    const nextSelectors = [
      'a[rel="next"]',
      'a[aria-label*="next" i]',
      'a[class*="next"]',
      'button[aria-label*="next" i]',
      '[class*="pagination"] a:last-child',
      '[class*="pager"] a:last-child',
      'a:has(svg[class*="arrow"])',
    ];

    for (const sel of nextSelectors) {
      try {
        const el = document.querySelector(sel) as HTMLAnchorElement | null;
        if (el && el.href && el.href !== current) {
          return el.href;
        }
      } catch {
        // querySelector with :has() may not be supported everywhere
      }
    }

    // Try common text-based next links
    const allLinks = Array.from(document.querySelectorAll('a'));
    for (const link of allLinks) {
      const text = link.textContent?.trim().toLowerCase() || '';
      if (
        (text === 'next' || text === 'next page' || text === '»' || text === '>') &&
        link.href &&
        link.href !== current
      ) {
        return link.href;
      }
    }

    return null;
  }, currentUrl);
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const BASE_URL = 'https://startups.rip';
  const maxPages = Number(process.env.STARTUPS_RIP_MAX_PAGES ?? searchParams.get('maxPages') ?? 100);
  const scrapeDetails = (process.env.STARTUPS_RIP_SCRAPE_DETAILS ?? searchParams.get('scrapeDetails') ?? 'false') === 'true';

  let browser: Browser | null = null;

  try {
    browser = await createBrowser();
    const listPage = await browser.newPage();

    const allStartups: StartupEntry[] = [];
    let currentUrl: string | null = BASE_URL;
    let pagesScraped = 0;
    const seenUrls = new Set<string>();

    // Crawl all listing pages
    while (currentUrl && pagesScraped < maxPages) {
      if (seenUrls.has(currentUrl)) break;
      seenUrls.add(currentUrl);

      await navigatePage(listPage, currentUrl);

      const pageEntries = await extractStartupsFromPage(listPage, currentUrl);

      // Only add entries whose URLs we haven't seen yet
      let newEntries = 0;
      for (const entry of pageEntries) {
        // Use URL as dedup key; fall back to a composite of name + sourceUrl to avoid
        // collapsing multiple "Unknown" entries that genuinely have no URL.
        const key = entry.url || `${entry.name}::${entry.sourceUrl}::${allStartups.length}`;
        if (!seenUrls.has(key)) {
          seenUrls.add(key);
          allStartups.push(entry);
          newEntries++;
        }
      }

      pagesScraped++;

      // If no new entries were added on this page, stop pagination
      if (newEntries === 0) break;

      // Find next page
      const nextUrl = await findNextPageUrl(listPage, currentUrl);
      currentUrl = nextUrl;
    }

    // Optionally enrich with detail pages
    if (scrapeDetails && allStartups.length > 0) {
      const detailPage = await browser.newPage();
      for (let i = 0; i < allStartups.length; i++) {
        const entry = allStartups[i];
        if (!entry.url || entry.url === BASE_URL) continue;

        const enriched = await scrapeDetailPage(detailPage, entry);

        // Merge in detail data, preferring existing values
        if (!entry.description && enriched.description) {
          entry.description = enriched.description;
        }
        if (!entry.reasonForShutdown && enriched.reasonForShutdown) {
          entry.reasonForShutdown = enriched.reasonForShutdown;
        }
        if (!entry.totalFunding && enriched.totalFunding) {
          entry.totalFunding = enriched.totalFunding;
        }
        if (!entry.foundedYear && enriched.foundedYear) {
          entry.foundedYear = enriched.foundedYear;
        }
        if (!entry.shutdownDate && enriched.shutdownDate) {
          entry.shutdownDate = enriched.shutdownDate;
        }
        if (!entry.location && enriched.location) {
          entry.location = enriched.location;
        }
        if (enriched.tags && enriched.tags.length > entry.tags.length) {
          entry.tags = enriched.tags;
        }
      }
      await detailPage.close();
    }

    await browser.close();

    const result: StartupsRipResult = {
      scrapedAt: new Date().toISOString(),
      totalStartups: allStartups.length,
      pagesScraped,
      startups: allStartups,
    };

    return NextResponse.json(result);
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    console.error('startups.rip scrape error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
