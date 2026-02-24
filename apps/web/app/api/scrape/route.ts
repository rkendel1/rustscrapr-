import { NextRequest, NextResponse } from 'next/server';

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

    // For now, return a mock response until WASM is integrated
    // TODO: Integrate WASM scraper module
    const mockResult = {
      pages: [
        {
          url,
          title: 'Sample Title',
          metaDescription: 'Sample meta description',
          headings: ['Heading 1', 'Heading 2'],
          textContent: html.substring(0, 500),
          links: {
            internal: [],
            external: [],
          },
          designTokens: config.extractDesignTokens ? {
            colors: [
              { value: '#000000', count: 5 },
              { value: '#ffffff', count: 3 },
            ],
            fontFamilies: ['Arial', 'sans-serif'],
            fontSizes: ['16px', '14px'],
            spacing: ['10px', '20px'],
            borderRadius: ['4px'],
            shadows: ['0 2px 4px rgba(0,0,0,0.1)'],
          } : undefined,
          assets: {
            logos: [],
            images: [],
            favicon: undefined,
            ogImage: undefined,
          },
        },
      ],
      site: {
        designTokens: config.extractDesignTokens ? {
          colors: [
            { value: '#000000', count: 5 },
            { value: '#ffffff', count: 3 },
          ],
          fontFamilies: ['Arial', 'sans-serif'],
          fontSizes: ['16px', '14px'],
          spacing: ['10px', '20px'],
          borderRadius: ['4px'],
          shadows: ['0 2px 4px rgba(0,0,0,0.1)'],
        } : undefined,
        allLinks: {
          internal: [],
          external: [],
        },
      },
    };

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
