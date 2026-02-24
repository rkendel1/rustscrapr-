import { NextRequest, NextResponse } from 'next/server';
import init, { scrape } from 'wasm-scraper';
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

    // Fetch HTML from the target URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RustScrapr/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Initialize and use WASM scraper
    await ensureWasmInit();
    const result = await scrape(html, url, config || {});

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
