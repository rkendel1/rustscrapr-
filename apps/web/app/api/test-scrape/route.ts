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
      // Use object parameter instead of deprecated buffer-only parameter
      await init({ module_or_path: wasmBuffer });
      wasmInitialized = true;
    } catch (error) {
      console.error('Failed to initialize WASM:', error);
      throw error;
    }
  }
}

// Sample HTML for testing
const SAMPLE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="A sample website for testing the Rust web scraper with design tokens">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <title>Sample Website - Design System Demo</title>
  <link rel="icon" href="/favicon.ico">
  <style>
    :root {
      --primary-color: #3b82f6;
      --secondary-color: #8b5cf6;
      --accent-color: #f59e0b;
      --text-color: #1f2937;
      --background: #ffffff;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-color);
      margin: 0;
      padding: 20px;
      background: var(--background);
    }
    
    h1 {
      font-size: 48px;
      color: var(--primary-color);
      margin-bottom: 16px;
    }
    
    h2 {
      font-size: 36px;
      color: var(--secondary-color);
      margin-top: 32px;
      margin-bottom: 16px;
    }
    
    h3 {
      font-size: 24px;
      color: var(--text-color);
      margin-top: 24px;
    }
    
    .card {
      background: #ffffff;
      border-radius: 8px;
      padding: 24px;
      margin: 16px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .button {
      background: var(--primary-color);
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
    }
    
    .secondary-btn {
      background: var(--secondary-color);
      padding: 10px 20px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <header>
    <img src="/logo.png" alt="Company Logo" width="200">
    <h1>Welcome to Our Design System</h1>
    <p>A modern, accessible, and beautiful design system for web applications</p>
  </header>
  
  <main>
    <h2>About Our Platform</h2>
    <div class="card">
      <h3>Fast and Reliable</h3>
      <p>We build products that are lightning-fast, reliable, and scale to millions of users.</p>
      <a href="/features">Learn more about our features</a>
    </div>
    
    <div class="card">
      <h3>Modern Technology Stack</h3>
      <p>Built with Rust, TypeScript, and modern web technologies for optimal performance.</p>
      <a href="/technology">Explore our tech stack</a>
    </div>
    
    <h2>Our Services</h2>
    <ul>
      <li><a href="/services/web-development">Web Development</a></li>
      <li><a href="/services/mobile-apps">Mobile Applications</a></li>
      <li><a href="/services/consulting">Technical Consulting</a></li>
    </ul>
    
    <h2>External Resources</h2>
    <p>Check out our profiles and resources:</p>
    <ul>
      <li><a href="https://github.com/example">GitHub</a></li>
      <li><a href="https://twitter.com/example">Twitter</a></li>
      <li><a href="https://linkedin.com/company/example">LinkedIn</a></li>
    </ul>
    
    <h2>Contact Us</h2>
    <p>Have questions? Reach out to our team:</p>
    <ul>
      <li>General Inquiries: <a href="mailto:info@example.com">info@example.com</a></li>
      <li>Sales: <a href="mailto:sales@example.com">sales@example.com</a></li>
      <li>Support: support@example.com</li>
    </ul>
  </main>
  
  <footer>
    <img src="/footer-logo.png" alt="Footer Logo">
    <p>&copy; 2024 Example Company. All rights reserved.</p>
    <nav>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
      <a href="/contact">Contact Us</a>
    </nav>
  </footer>
</body>
</html>
`;

export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json();

    // Initialize and use WASM scraper with sample HTML
    await ensureWasmInit();
    const result = await scrape(SAMPLE_HTML, 'https://example.com', config || {});

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
