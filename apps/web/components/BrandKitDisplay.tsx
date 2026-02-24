'use client';

import { BrandKit } from '@/types';

interface BrandKitDisplayProps {
  brandKit: BrandKit;
}

export function BrandKitDisplay({ brandKit }: BrandKitDisplayProps) {
  const { tokens } = brandKit;

  return (
    <div className="space-y-8 p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{brandKit.name}</h2>
            <p className="text-sm text-slate-600 mt-1">
              Last updated: {new Date(brandKit.updatedAt || '').toLocaleDateString()}
            </p>
          </div>
          {tokens.logo && (
            <img 
              src={tokens.logo.url} 
              alt={`${brandKit.name} logo`}
              className="h-12 object-contain"
            />
          )}
        </div>
        <p className="text-slate-700 mt-4">{brandKit.tagline}</p>
      </div>

      {/* Color Palette */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Color Palette</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(tokens.colors).map(([key, value]) => {
            if (key === 'text') return null;
            return (
              <div key={key} className="space-y-2">
                <div
                  className="h-24 rounded-lg border-2 border-slate-200 shadow-sm"
                  style={{ backgroundColor: value as string }}
                />
                <div className="text-sm">
                  <div className="font-semibold capitalize text-slate-900">{key}</div>
                  <div className="font-mono text-xs text-slate-600">{value as string}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Text Colors */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Text Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(tokens.colors.text).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div
                className="h-24 rounded-lg border-2 border-slate-200 shadow-sm"
                style={{ backgroundColor: value }}
              />
              <div className="text-sm">
                <div className="font-semibold capitalize text-slate-900">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="font-mono text-xs text-slate-600">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Typography</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Heading Font */}
          <div className="bg-slate-50 p-6 rounded-lg">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">
              Heading Font: {tokens.typography.fontFamily.heading.split(',')[0].replace(/"/g, '')}
            </h4>
            <div style={{ fontFamily: tokens.typography.fontFamily.heading }}>
              <p className="text-4xl mb-2">Aa</p>
              <p className="text-sm text-slate-600">Used for titles and major headings.</p>
            </div>
            <div className="mt-3 text-xs font-mono text-slate-500">
              {tokens.typography.fontFamily.heading}
            </div>
          </div>

          {/* Body Font */}
          <div className="bg-slate-50 p-6 rounded-lg">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">
              Body Font: {tokens.typography.fontFamily.body.split(',')[0].replace(/"/g, '')}
            </h4>
            <div style={{ fontFamily: tokens.typography.fontFamily.body }}>
              <p className="text-base mb-2">The quick brown fox jumps over the lazy dog.</p>
              <p className="text-sm text-slate-600">Used for paragraphs and general text.</p>
            </div>
            <div className="mt-3 text-xs font-mono text-slate-500">
              {tokens.typography.fontFamily.body}
            </div>
          </div>
        </div>

        {/* Font Sizes */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Font Size Scale</h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(tokens.typography.fontSize).map(([key, value]) => (
              <div key={key} className="bg-slate-50 p-3 rounded text-center">
                <div className="text-xs text-slate-600 mb-1">{key}</div>
                <div className="font-mono text-xs font-semibold text-slate-900">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice & Tone */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Voice & Tone</h3>
        <div className="bg-slate-50 p-6 rounded-lg space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Tone</h4>
              <p className="text-slate-900">{tokens.voice.tone}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Personality</h4>
              <p className="text-slate-900">{tokens.voice.personality}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Key Phrases</h4>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-slate-600">Example Headline:</span>
                <p className="text-slate-900 italic mt-1">&quot;{tokens.voice.examples.headline}&quot;</p>
              </div>
              <div>
                <span className="text-xs text-slate-600">Example CTA:</span>
                <p className="text-slate-900 italic mt-1">&quot;{tokens.voice.examples.cta}&quot;</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacing, Radius, Shadows */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Spacing */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Spacing</h3>
          <div className="space-y-2">
            {Object.entries(tokens.spacing).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between bg-slate-50 p-3 rounded">
                <span className="font-mono text-sm text-slate-700">{key}</span>
                <span className="font-mono text-sm text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Border Radius</h3>
          <div className="space-y-2">
            {Object.entries(tokens.radius).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{key}</span>
                  <span className="font-mono text-slate-900">{value}</span>
                </div>
                <div 
                  className="h-12 bg-slate-200 border-2 border-slate-400"
                  style={{ borderRadius: value }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Shadows */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Shadows</h3>
          <div className="space-y-3">
            {Object.entries(tokens.shadows).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="text-sm text-slate-700">{key}</div>
                <div 
                  className="h-12 bg-white rounded"
                  style={{ boxShadow: value }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="border-t pt-6">
        <button
          onClick={() => {
            const json = JSON.stringify(brandKit, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${brandKit.name.toLowerCase().replace(/\s+/g, '-')}-brand-kit.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Export Brand Kit (JSON)
        </button>
      </div>
    </div>
  );
}
