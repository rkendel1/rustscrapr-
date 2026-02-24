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
      // Use a more lenient wait strategy to avoid timeouts
      // Try domcontentloaded first, then fall back to load
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      } catch (error) {
        // If domcontentloaded fails, try with just 'load'
        console.warn(`domcontentloaded failed for ${url}, retrying with load:`, error);
        await page.goto(url, { waitUntil: 'load', timeout: 90000 });
      }
      
      // Wait for body element to ensure page is loaded
      await page.waitForSelector('body', { timeout: 5000 }).catch(() => {
        console.warn('Body element not found, continuing anyway');
      });
      
      const html = await page.content();
      await browser.close();

      // Initialize and use WASM scraper
      await ensureWasmInit();
      const result = await scrape(html, url, config || {});

      // Enhanced AI analysis with OpenAI for brand voice and color categorization
      if (process.env.OPENAI_API_KEY && result.site.designTokens) {
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const page = result.pages[0];
        const tokens = result.site.designTokens;

        // Create a concise prompt for AI analysis
        const analysisPrompt = `Analyze this website and provide brand voice & tone analysis and semantic color categorization.

Website: ${page.title}
URL: ${page.url}
Description: ${page.metaDescription}
Key Headlines: ${page.headings.slice(0, 5).join(', ')}
Text Sample: ${page.textContent.substring(0, 500)}

Available Colors: ${tokens.colors.slice(0, 10).map(c => c.value).join(', ')}
Available Fonts: ${tokens.fontFamilies.join(', ')}

Provide a JSON response with this exact structure:
{
  "voice": {
    "tone": "brief tone description (e.g., Professional and reassuring)",
    "personality": "personality traits (e.g., Confident and knowledgeable)",
    "examples": {
      "headline": "example headline in their style",
      "cta": "example call-to-action button text"
    }
  },
  "colors": {
    "primary": "main brand color from available colors",
    "secondary": "secondary color",
    "accent": "accent color",
    "background": "background color (lightest)",
    "surface": "surface color",
    "error": "error state color (reddish)",
    "warning": "warning state color (yellowish/orange)",
    "success": "success state color (greenish)",
    "text": {
      "primary": "main text color (darkest)",
      "secondary": "secondary text color",
      "muted": "muted text color",
      "onPrimary": "text on primary color (light)"
    }
  }
}

Use ONLY colors from the available colors list. Choose the most appropriate semantic mapping.`;

        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: analysisPrompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          });

          const aiAnalysisRaw = completion.choices[0]?.message?.content;
          if (aiAnalysisRaw) {
            const aiAnalysis = JSON.parse(aiAnalysisRaw);
            
            // Update brand voice in the result
            if (aiAnalysis.voice) {
              result.site.brandVoice = {
                tone: aiAnalysis.voice.tone || 'Professional',
                personality: aiAnalysis.voice.personality || 'Reliable',
                keyPhrases: [aiAnalysis.voice.examples?.cta || 'Get Started'],
                exampleHeadline: aiAnalysis.voice.examples?.headline || page.headings[0] || 'Welcome',
              };
            }

            // Store AI analysis for brand kit transformation
            result.aiAnalysis = aiAnalysis;
          }
        } catch (aiError) {
          console.error('AI analysis error:', aiError);
          // Continue without AI analysis
        }
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
