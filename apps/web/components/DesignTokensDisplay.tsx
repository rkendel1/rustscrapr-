'use client';

import { DesignTokens } from '@/types';

interface DesignTokensDisplayProps {
  tokens: DesignTokens;
  title?: string;
}

export function DesignTokensDisplay({ tokens, title }: DesignTokensDisplayProps) {
  return (
    <div className="space-y-6">
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600 mt-1">
            Aggregated design tokens from all scraped pages
          </p>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Colors ({tokens.colors.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {tokens.colors.map((color, i) => (
            <div key={i} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
              <div
                className="w-12 h-12 rounded-md border-2 border-slate-300 shadow-sm"
                style={{ backgroundColor: color.value }}
                title={color.value}
              />
              <div className="text-xs flex-1">
                <div className="font-mono text-slate-900 font-semibold">{color.value}</div>
                <div className="text-slate-600">×{color.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Font Families ({tokens.fontFamilies.length})
        </h3>
        <ul className="space-y-2">
          {tokens.fontFamilies.map((font, i) => (
            <li key={i} className="text-sm text-slate-800 font-mono bg-slate-50 px-3 py-2 rounded">
              {font}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Font Sizes ({tokens.fontSizes.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {tokens.fontSizes.map((size, i) => (
            <span key={i} className="px-4 py-2 bg-slate-100 rounded-md text-sm font-mono text-slate-800 border border-slate-200">
              {size}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Spacing ({tokens.spacing.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {tokens.spacing.map((space, i) => (
            <span key={i} className="px-4 py-2 bg-slate-100 rounded-md text-sm font-mono text-slate-800 border border-slate-200">
              {space}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Border Radius ({tokens.borderRadius.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {tokens.borderRadius.map((radius, i) => (
            <span key={i} className="px-4 py-2 bg-slate-100 rounded-md text-sm font-mono text-slate-800 border border-slate-200">
              {radius}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Shadows ({tokens.shadows.length})
        </h3>
        <ul className="space-y-2">
          {tokens.shadows.map((shadow, i) => (
            <li key={i} className="text-sm text-slate-800 font-mono bg-slate-50 px-3 py-2 rounded break-all">
              {shadow}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
