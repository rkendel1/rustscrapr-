export interface ScraperConfig {
  crawlDepth?: number;
  maxPages?: number;
  extractDesignTokens?: boolean;
  summarizeBrand?: boolean;
}

export interface ColorToken {
  value: string;
  count: number;
}

export interface Typography {
  headingFont: string;
  headingFallbacks: string[];
  bodyFont: string;
  bodyFallbacks: string[];
}

export interface TextColors {
  muted?: string;
  onPrimary?: string;
  primary?: string;
  secondary?: string;
}

export interface DesignTokens {
  colors: ColorToken[];
  fontFamilies: string[];
  fontSizes: string[];
  spacing: string[];
  borderRadius: string[];
  shadows: string[];
  typography: Typography;
  textColors: TextColors;
}

export interface LinkData {
  internal: string[];
  external: string[];
}

export interface AssetData {
  logos: string[];
  images: string[];
  favicon?: string;
  ogImage?: string;
}

export interface PageData {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  textContent: string;
  emails: string[];
  links: LinkData;
  designTokens?: DesignTokens;
  assets: AssetData;
}

export interface BrandVoice {
  tone: string;
  personality: string;
  keyPhrases: string[];
  exampleHeadline: string;
}

export interface SiteData {
  designTokens?: DesignTokens;
  allLinks: LinkData;
  brandVoice?: BrandVoice;
}

export interface ScraperResult {
  pages: PageData[];
  site: SiteData;
}

export interface BrandAnalysis {
  tone: string;
  industry: string;
  audience: string;
  valueProps: string[];
}

export interface DesignSystemAnalysis {
  colorRoles: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  typographyScale: Record<string, string>;
}

// New Brand Kit Structure
export interface BrandKitColors {
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
}

export interface BrandKitTypography {
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
    '2xl': string;
  };
}

export interface BrandKitVoice {
  tone: string;
  personality: string;
  examples: {
    headline: string;
    cta: string;
  };
}

export interface BrandKit {
  _id?: string;
  _creationTime?: number;
  name: string;
  url: string;
  tagline: string;
  updatedAt?: string;
  userId?: string;
  tokens: {
    colors: BrandKitColors;
    logo?: {
      url: string;
    };
    name: string;
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
      '4': string;
      '8': string;
    };
    tagline: string;
    typography: BrandKitTypography;
    voice: BrandKitVoice;
  };
}
