import { ScraperResult, BrandKit, BrandKitColors, DesignTokens, ColorToken } from '@/types';

/**
 * Transform scraper result into brand kit format
 */
export function transformToBrandKit(result: ScraperResult, aiAnalysis?: any): BrandKit {
  const page = result.pages[0];
  const tokens = result.site.designTokens;
  const brandVoice = result.site.brandVoice;

  if (!tokens) {
    throw new Error('No design tokens found in scraper result');
  }

  // Extract semantic colors from the token list
  const colors = categorizeColors(tokens.colors, aiAnalysis);

  // Extract typography
  const typography = extractTypography(tokens);

  // Extract radius
  const radius = extractRadius(tokens.borderRadius);

  // Extract shadows
  const shadows = extractShadows(tokens.shadows);

  // Extract spacing
  const spacing = extractSpacing(tokens.spacing);

  // Extract voice and tone
  const voice = extractVoice(brandVoice, page, aiAnalysis);

  // Get logo
  const logo = page.assets.logos.length > 0 
    ? { url: page.assets.logos[0] }
    : undefined;

  const brandKit: BrandKit = {
    name: page.title || extractDomainName(page.url),
    url: page.url,
    tagline: page.metaDescription || page.headings[0] || '',
    updatedAt: new Date().toISOString(),
    tokens: {
      colors,
      logo,
      name: page.title || extractDomainName(page.url),
      radius,
      shadows,
      spacing,
      tagline: page.metaDescription || page.headings[0] || '',
      typography,
      voice,
    },
  };

  return brandKit;
}

/**
 * Categorize colors into semantic roles
 */
function categorizeColors(colorTokens: ColorToken[], aiAnalysis?: any): BrandKitColors {
  // If AI analysis provided semantic color mapping, use it
  if (aiAnalysis?.colors) {
    return aiAnalysis.colors;
  }

  // Otherwise, use heuristics
  const colors = colorTokens.map(c => c.value);
  
  // Simple heuristic categorization
  const categorized: BrandKitColors = {
    primary: colors[0] || 'rgb(0, 0, 0)',
    secondary: colors[1] || 'rgb(100, 100, 100)',
    accent: colors[2] || 'rgb(0, 100, 200)',
    background: findLightestColor(colors) || 'rgb(255, 255, 255)',
    surface: findSecondLightestColor(colors) || 'rgb(250, 250, 250)',
    error: findRedishColor(colors) || 'rgb(220, 50, 50)',
    warning: findYellowishColor(colors) || 'rgb(250, 200, 50)',
    success: findGreenishColor(colors) || 'rgb(50, 200, 100)',
    text: {
      primary: findDarkestColor(colors) || 'rgb(0, 0, 0)',
      secondary: findSecondDarkestColor(colors) || 'rgb(100, 100, 100)',
      muted: findMutedColor(colors) || 'rgb(150, 150, 150)',
      onPrimary: findLightestColor(colors) || 'rgb(255, 255, 255)',
    },
  };

  return categorized;
}

/**
 * Extract typography information
 */
function extractTypography(tokens: DesignTokens) {
  const { typography, fontSizes } = tokens;

  return {
    fontFamily: {
      heading: formatFontFamily(typography.headingFont, typography.headingFallbacks),
      body: formatFontFamily(typography.bodyFont, typography.bodyFallbacks),
    },
    fontSize: {
      xs: fontSizes[5] || '12px',
      sm: fontSizes[4] || '14px',
      base: fontSizes[3] || '16px',
      lg: fontSizes[2] || '18px',
      xl: fontSizes[1] || '24px',
      '2xl': fontSizes[0] || '36px',
    },
  };
}

/**
 * Format font family string
 */
function formatFontFamily(primary: string, fallbacks: string[]): string {
  if (!primary) return 'sans-serif';
  
  const formatted = [primary, ...fallbacks]
    .filter(f => f && f.trim())
    .map(f => f.includes(' ') && !f.startsWith('"') ? `"${f}"` : f)
    .join(', ');
  
  return formatted || 'sans-serif';
}

/**
 * Extract radius values
 */
function extractRadius(borderRadius: string[]) {
  return {
    default: borderRadius[0] || '4px',
    lg: borderRadius[1] || '8px',
    full: '9999px',
  };
}

/**
 * Extract shadow values
 */
function extractShadows(shadows: string[]) {
  return {
    default: shadows[0] || 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
    md: shadows[1] || 'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px',
    lg: shadows[2] || 'rgba(0, 0, 0, 0.4) 0px 0px 0px 2px',
  };
}

/**
 * Extract spacing values
 */
function extractSpacing(spacing: string[]) {
  return {
    '4': spacing[0] || '16px',
    '8': spacing[1] || '32px',
  };
}

/**
 * Extract voice and tone
 */
function extractVoice(brandVoice: any, page: any, aiAnalysis?: any) {
  if (aiAnalysis?.voice) {
    return aiAnalysis.voice;
  }

  if (brandVoice) {
    return {
      tone: brandVoice.tone,
      personality: brandVoice.personality,
      examples: {
        headline: brandVoice.exampleHeadline,
        cta: brandVoice.keyPhrases[0] || 'Get Started',
      },
    };
  }

  // Default voice based on page content
  return {
    tone: 'Professional',
    personality: 'Reliable, Trustworthy',
    examples: {
      headline: page.headings[0] || 'Welcome',
      cta: 'Get Started',
    },
  };
}

/**
 * Extract domain name from URL
 */
function extractDomainName(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Brand';
  }
}

// Color utility functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbStringToValues(rgb: string): { r: number; g: number; b: number } | null {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match
    ? { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) }
    : null;
}

function getBrightness(color: string): number {
  let rgb = color.startsWith('#') 
    ? hexToRgb(color) 
    : rgbStringToValues(color);
  
  if (!rgb) return 128;
  return (rgb.r + rgb.g + rgb.b) / 3;
}

function findLightestColor(colors: string[]): string | undefined {
  return colors.sort((a, b) => getBrightness(b) - getBrightness(a))[0];
}

function findSecondLightestColor(colors: string[]): string | undefined {
  return colors.sort((a, b) => getBrightness(b) - getBrightness(a))[1];
}

function findDarkestColor(colors: string[]): string | undefined {
  return colors.sort((a, b) => getBrightness(a) - getBrightness(b))[0];
}

function findSecondDarkestColor(colors: string[]): string | undefined {
  return colors.sort((a, b) => getBrightness(a) - getBrightness(b))[1];
}

function findMutedColor(colors: string[]): string | undefined {
  return colors.find(c => {
    const brightness = getBrightness(c);
    return brightness > 100 && brightness < 180;
  });
}

function findRedishColor(colors: string[]): string | undefined {
  return colors.find(c => {
    const rgb = c.startsWith('#') ? hexToRgb(c) : rgbStringToValues(c);
    if (!rgb) return false;
    return rgb.r > rgb.g && rgb.r > rgb.b && rgb.r > 150;
  });
}

function findGreenishColor(colors: string[]): string | undefined {
  return colors.find(c => {
    const rgb = c.startsWith('#') ? hexToRgb(c) : rgbStringToValues(c);
    if (!rgb) return false;
    return rgb.g > rgb.r && rgb.g > rgb.b && rgb.g > 150;
  });
}

function findYellowishColor(colors: string[]): string | undefined {
  return colors.find(c => {
    const rgb = c.startsWith('#') ? hexToRgb(c) : rgbStringToValues(c);
    if (!rgb) return false;
    return rgb.r > 200 && rgb.g > 150 && rgb.b < 100;
  });
}
