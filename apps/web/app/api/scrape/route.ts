import { NextRequest, NextResponse } from 'next/server';
import init, { scrape } from 'wasm-scraper';
import puppeteer from 'puppeteer';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Initialize WASM module
let wasmInitialized = false;
async function ensureWasmInit() {
  if (!wasmInitialized) {
    try {
      // Load the WASM file directly from the package
      const wasmPath = join(process.cwd(), '..', '..', 'packages', 'wasm-scraper', 'pkg', 'wasm_scraper_bg.wasm');
      const wasmBuffer = await readFile(wasmPath);
      await init(wasmBuffer);
      wasmInitialized = true;
    } catch (error) {
      console.error('Failed to initialize WASM:', error);
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, config } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Use Puppeteer to fetch HTML, bypassing Cloudflare
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Dest': 'document',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.google.com/',
      });
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      const html = await page.content();
      await browser.close();

      // Initialize and use WASM scraper
      await ensureWasmInit();
      const result = await scrape(html, url, config || {});

      // Brand analysis with OpenAI
      if (process.env.OPENAI_API_KEY) {
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const prompt = `Analyze the following scraped webpage data for brand mentions, key products, and marketing insights: ${JSON.stringify(result)}`;
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
        });
        const analysis = completion.choices[0]?.message?.content || 'No analysis available.';
        result.brandAnalysis = analysis;
      } else {
        result.brandAnalysis = 'OpenAI API key not configured.';
      }

      return NextResponse.json(result);
    } catch (puppError) {
      if (browser) {
        await browser.close();
      }
      throw puppError;
    }
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
