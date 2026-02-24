# Brand Kit Feature

This feature generates comprehensive brand kits from scraped websites, including colors, typography, voice & tone analysis.

## Overview

The brand kit feature extracts and categorizes design tokens from websites into a structured format that can be used for brand analysis, design systems, and marketing insights.

## Features

### 1. **Semantic Color Categorization**
Colors are automatically categorized into semantic roles:
- **Primary**: Main brand color
- **Secondary**: Supporting brand color
- **Accent**: Accent/highlight color
- **Background**: Page background color
- **Surface**: Surface/card background color
- **Error**: Error state color (typically red)
- **Warning**: Warning state color (typically yellow/orange)
- **Success**: Success state color (typically green)
- **Text Colors**:
  - Primary: Main text color
  - Secondary: Secondary text color
  - Muted: Muted/disabled text color
  - OnPrimary: Text color on primary backgrounds

### 2. **Typography System**
Extracts and structures font information:
- **Heading Font**: Primary font for headings with fallbacks
- **Body Font**: Primary font for body text with fallbacks
- **Font Size Scale**: Standardized scale (xs, sm, base, lg, xl, 2xl)

### 3. **Voice & Tone Analysis** (AI-Powered)
Uses OpenAI to analyze brand voice:
- **Tone**: Communication tone (e.g., "Professional and reassuring")
- **Personality**: Brand personality traits (e.g., "Confident and knowledgeable")
- **Examples**:
  - Sample headline in brand voice
  - Sample call-to-action text

### 4. **Design System Elements**
- **Border Radius**: default, lg, full
- **Shadows**: default, md, lg
- **Spacing**: Common spacing values

## Data Structure

The brand kit produces an exportable JSON object with this structure:

```typescript
{
  name: string;              // Brand/company name
  url: string;               // Website URL
  tagline: string;           // Meta description or main tagline
  updatedAt: string;         // ISO timestamp
  tokens: {
    colors: {
      accent: string;
      background: string;
      error: string;
      primary: string;
      secondary: string;
      success: string;
      surface: string;
      warning: string;
      text: {
        muted: string;
        onPrimary: string;
        primary: string;
        secondary: string;
      };
    };
    logo?: {
      url: string;
    };
    radius: {
      default: string;
      lg: string;
      full: string;
    };
    shadows: {
      default: string;
      md: string;
      lg: string;
    };
    spacing: {
      "4": string;
      "8": string;
    };
    typography: {
      fontFamily: {
        heading: string;
        body: string;
      };
      fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        "2xl": string;
      };
    };
    voice: {
      tone: string;
      personality: string;
      examples: {
        headline: string;
        cta: string;
      };
    };
  };
}
```

## Implementation

### Backend (Rust/WASM)
- `packages/wasm-scraper/src/lib.rs`: Core data structures (DesignTokens, Typography, TextColors, BrandVoice)
- `packages/wasm-scraper/src/design_tokens.rs`: Token extraction logic with color brightness analysis

### Frontend (TypeScript/React)
- `apps/web/lib/brandKitTransformer.ts`: Transforms scraper output to brand kit format
- `apps/web/components/BrandKitDisplay.tsx`: React component for displaying brand kits
- `apps/web/types/index.ts`: TypeScript type definitions

### API
- `apps/web/app/api/scrape/route.ts`: Enhanced with OpenAI integration for voice/tone analysis

## AI Integration

The feature uses OpenAI GPT-4o-mini to:
1. Analyze brand voice and tone from website content
2. Map extracted colors to semantic roles
3. Generate example headlines and CTAs in brand voice

### Requirements
- OpenAI API key must be set as `OPENAI_API_KEY` environment variable
- Falls back to heuristic-based categorization if AI is unavailable

## Usage

### 1. Scrape a website
```typescript
const response = await fetch('/api/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    config: { extractDesignTokens: true }
  })
});

const result = await response.json();
```

### 2. Transform to brand kit
```typescript
import { transformToBrandKit } from '@/lib/brandKitTransformer';

const brandKit = transformToBrandKit(result, result.aiAnalysis);
```

### 3. Display or export
```typescript
<BrandKitDisplay brandKit={brandKit} />
```

The component includes an export button to download the brand kit as JSON.

## Color Categorization Logic

When AI is not available, the system uses heuristics:
- **Brightness-based**: Analyzes RGB/hex values to determine brightness
- **Dark colors** (brightness < 100) → Text colors
- **Light colors** (brightness > 200) → Backgrounds
- **Medium colors** (100-180) → Muted/secondary
- **Color hue analysis** → Detects red/green/yellow for semantic states

## Testing

Run the test script:
```bash
./test-brand-kit.sh
```

Or manually:
1. Build WASM: `cd packages/wasm-scraper && wasm-pack build --target web`
2. Install deps: `npm install`
3. Build Next.js: `cd apps/web && npx next build`
4. Run dev server: `npm run dev`
5. Test with a URL like https://supabase.com

## Example Output

See the reference images in the issue for the expected UI layout showing:
- Color palette with semantic categorization
- Text colors
- Typography with font previews
- Voice & tone analysis
- Design system elements (spacing, radius, shadows)

## Future Enhancements

- [ ] Support for multiple brand themes (light/dark mode)
- [ ] More sophisticated color role detection
- [ ] Extended typography scale
- [ ] Animation/transition token extraction
- [ ] Export to Figma/Sketch format
- [ ] Database storage of brand kits
