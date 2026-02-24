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

export interface DesignTokens {
  colors: ColorToken[];
  fontFamilies: string[];
  fontSizes: string[];
  spacing: string[];
  borderRadius: string[];
  shadows: string[];
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

export interface SiteData {
  designTokens?: DesignTokens;
  allLinks: LinkData;
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
