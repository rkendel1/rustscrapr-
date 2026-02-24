export interface BrandAnalysisInput {
  textContent: string;
  designTokens?: any;
  topLinks?: string[];
}

export interface BrandAnalysisOutput {
  brandSummary: {
    tone: string;
    industry: string;
    audience: string;
    valueProps: string[];
  };
  designSystem: {
    colorRoles: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    typographyScale: Record<string, string>;
  };
}

export class BrandAnalyzer {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyze(input: BrandAnalysisInput): Promise<BrandAnalysisOutput> {
    // This is a placeholder for the actual OpenAI integration
    // In production, this would call the OpenAI API with a structured prompt
    
    const prompt = this.buildPrompt(input);
    
    // Mock response for now
    return {
      brandSummary: {
        tone: 'Professional and friendly',
        industry: 'Technology',
        audience: 'Developers and businesses',
        valueProps: [
          'Fast and efficient web scraping',
          'AI-powered insights',
          'Easy to use interface',
        ],
      },
      designSystem: {
        colorRoles: {
          primary: input.designTokens?.colors?.[0]?.value || '#000000',
          secondary: input.designTokens?.colors?.[1]?.value || '#666666',
          accent: input.designTokens?.colors?.[2]?.value || '#0066cc',
        },
        typographyScale: {
          'heading-1': input.designTokens?.fontSizes?.[0] || '32px',
          'heading-2': input.designTokens?.fontSizes?.[1] || '24px',
          'body': input.designTokens?.fontSizes?.[2] || '16px',
        },
      },
    };
  }

  private buildPrompt(input: BrandAnalysisInput): string {
    return `
You are a brand and design system analyst.

Based on the following website data, analyze and classify:

1. Brand Personality:
   - Tone of voice
   - Industry/vertical
   - Target audience (ICP)
   - Key value propositions

2. Visual Design System:
   - Map raw design tokens to semantic roles (primary, secondary, accent colors)
   - Identify typography scale and hierarchy
   - Describe overall visual style

Website Content Preview:
${input.textContent.substring(0, 1000)}

${input.designTokens ? `
Design Tokens Found:
- Colors: ${JSON.stringify(input.designTokens.colors?.slice(0, 5))}
- Font Families: ${JSON.stringify(input.designTokens.fontFamilies)}
- Font Sizes: ${JSON.stringify(input.designTokens.fontSizes)}
` : ''}

Provide your analysis in a structured format focusing on actionable insights.
    `.trim();
  }
}

export async function analyzeBrand(
  input: BrandAnalysisInput,
  apiKey?: string
): Promise<BrandAnalysisOutput> {
  const analyzer = new BrandAnalyzer(apiKey || process.env.OPENAI_API_KEY || '');
  return analyzer.analyze(input);
}
