# 🦀 Rust WASM AI Web Scraper

A production-ready web scraping system combining Rust/WASM for high-performance parsing with Next.js for a modern UI and AI-powered analysis.

## 🧠 System Overview

This project extracts:
- **Content**: Title, meta tags, headings, and body text
- **Links**: Internal and external links (normalized)
- **Design Tokens**: Colors, fonts, spacing, shadows from CSS
- **Assets**: Logos, images, favicons, OG images
- **AI Analysis**: Brand personality and design system insights (optional)

### Architecture

```
Next.js UI
   │
API Route (fetch HTML)
   │
Rust WASM Scraper (parse & structure)
   │
Structured Data
   │
AI Analysis (optional)
   │
Results UI (tabs)
```

## 📦 Project Structure

```
rustscrapr-/
├── apps/
│   └── web/              # Next.js application
│       ├── app/          # App router pages
│       ├── components/   # React components
│       └── types/        # TypeScript types
├── packages/
│   ├── wasm-scraper/     # Rust → WASM scraper
│   │   └── src/
│   │       ├── lib.rs           # Main WASM API
│   │       ├── parser.rs        # Content extraction
│   │       ├── links.rs         # Link extraction
│   │       ├── design_tokens.rs # CSS/design parsing
│   │       └── assets.rs        # Asset detection
│   └── ai/               # AI analysis utilities
└── package.json          # Workspace root
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70+ and Cargo
- **wasm-pack** (install with `cargo install wasm-pack`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rkendel1/rustscrapr-.git
   cd rustscrapr-
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd apps/web && npm install
   cd ../../packages/ai && npm install
   cd ../..
   ```

3. **Build the WASM module**
   ```bash
   npm run build:wasm
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Build Commands

```bash
# Development
npm run dev              # Start Next.js dev server

# Build
npm run build:wasm       # Compile Rust to WASM
npm run build:web        # Build Next.js app
npm run build            # Build everything

# Production
cd apps/web && npm run start  # Start production server
```

## 📝 Usage

### Web UI

1. Enter a website URL (e.g., `https://example.com`)
2. Configure options:
   - **Crawl Depth**: How many levels deep to crawl (1-3)
   - **Max Pages**: Maximum number of pages to scrape (1-20)
   - **Extract Design Tokens**: Parse CSS for colors, fonts, etc.
   - **AI Brand Analysis**: Generate brand insights (requires API key)
3. Click "Scrape Website"
4. View results in tabs:
   - **Content**: Title, meta, headings, text
   - **Links**: Internal and external links
   - **Design Tokens**: Colors, fonts, spacing, etc.
   - **Assets**: Images, logos, favicons

### API Integration

The scraper can also be used programmatically:

```typescript
// POST /api/scrape
const response = await fetch('/api/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    config: {
      crawlDepth: 1,
      maxPages: 5,
      extractDesignTokens: true,
      summarizeBrand: false
    }
  })
});

const result = await response.json();
```

## 🔑 Configuration

### Environment Variables

Create a `.env.local` file in `apps/web/`:

```env
# Optional: For AI brand analysis
OPENAI_API_KEY=sk-...
```

### Scraper Config

```typescript
interface ScraperConfig {
  crawlDepth?: number;        // Default: 1
  maxPages?: number;          // Default: 5
  extractDesignTokens?: boolean;  // Default: true
  summarizeBrand?: boolean;   // Default: false
}
```

## 🎨 Design Token Extraction

The scraper extracts and deduplicates:
- **Colors**: Hex, RGB, RGBA, HSL, HSLA (ranked by frequency)
- **Font Families**: All font-family declarations
- **Font Sizes**: All font-size values
- **Spacing**: margin and padding values
- **Border Radius**: border-radius values
- **Shadows**: box-shadow definitions

Tokens are pre-clustered in Rust to reduce AI analysis costs.

## 🤖 AI Analysis

When enabled, the AI layer provides:

### Brand Summary
- Tone of voice
- Industry/vertical classification
- Target audience (ICP)
- Key value propositions

### Design System Analysis
- Semantic color roles (primary, secondary, accent)
- Typography scale mapping
- Visual style classification

The AI prompt is structured to provide actionable insights from the raw scraped data.

## 🔒 Security Model

- **Server-side scraping**: HTML fetching happens in Next.js API routes
  - ✅ Bypasses CORS restrictions
  - ✅ Hides API keys from client
  - ✅ Avoids bot detection in browser
- **WASM parsing**: Client or server-side DOM/CSS parsing
  - ✅ Fast and memory-efficient
  - ✅ No external dependencies
  - ✅ Sandboxed execution

## ⚡ Performance

- WASM compile time: ~20-40ms
- Parsing: Very fast (pure Rust)
- Memory: Low footprint
- Edge-compatible: Can run on Vercel Edge Functions

## 🧩 Integration Ideas

Use this scraper as a creator tool for:
- **Auto-theming**: Extract design tokens → generate Tailwind config
- **Brand analysis**: Understand competitor positioning
- **Content migration**: Extract structured content from legacy sites
- **Design system documentation**: Automatically document existing sites
- **Personalization**: Adapt UI based on source website style

## 📋 Roadmap

### Phase 1 (Current)
- [x] Rust WASM scraper core
- [x] Next.js UI
- [x] Basic content extraction
- [x] Design token extraction
- [x] Link and asset detection
- [ ] WASM integration with Next.js (in progress)

### Phase 2 (Future)
- [ ] Multi-page crawling with depth control
- [ ] Component detection (hero, navbar, footer)
- [ ] Layout density scoring
- [ ] UI style classification ("shadcn-like", "material-like")
- [ ] Design token → Tailwind config generator
- [ ] Brand → LLM system prompt generator
- [ ] Real-time AI analysis with streaming
- [ ] Export to multiple formats (JSON, YAML, CSS)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- [Rust](https://www.rust-lang.org/) & [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen)
- [scraper](https://github.com/causal-agent/scraper) - HTML parsing
- [lightningcss](https://lightningcss.dev/) - CSS parsing
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [OpenAI](https://openai.com/) - AI analysis
