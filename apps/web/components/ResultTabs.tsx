'use client';

import { useState, useMemo } from 'react';
import { ScraperResult } from '@/types';
import { DesignTokensDisplay } from './DesignTokensDisplay';
import { BrandKitDisplay } from './BrandKitDisplay';
import { transformToBrandKit } from '@/lib/brandKitTransformer';

interface ResultTabsProps {
  result: ScraperResult;
}

export function ResultTabs({ result }: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<'brandkit' | 'content' | 'links' | 'design' | 'assets'>('brandkit');

  const page = result.pages[0];
  const siteTokens = result.site?.designTokens;

  // Transform to brand kit format
  const brandKit = useMemo(() => {
    if (!siteTokens) return null;
    try {
      return transformToBrandKit(result, (result as any).aiAnalysis);
    } catch (e) {
      console.error('Failed to transform to brand kit:', e);
      return null;
    }
  }, [result, siteTokens]);

  const tabs = [
    { id: 'brandkit' as const, label: 'Brand Kit', icon: '🎨' },
    { id: 'content' as const, label: 'Content', icon: '📄' },
    { id: 'links' as const, label: 'Links', icon: '🔗' },
    { id: 'design' as const, label: 'Design Tokens', icon: '🔧' },
    { id: 'assets' as const, label: 'Assets', icon: '🖼️' },
  ];

  return (
    <div>
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === 'brandkit' && (
          <div>
            {brandKit ? (
              <BrandKitDisplay brandKit={brandKit} />
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <p className="text-slate-600">Brand Kit generation requires design tokens to be extracted.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Title</h3>
              <p className="text-slate-700">{page.title || 'No title found'}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Meta Description</h3>
              <p className="text-slate-700">{page.metaDescription || 'No meta description found'}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Headings</h3>
              <ul className="space-y-1">
                {page.headings.length > 0 ? (
                  page.headings.slice(0, 10).map((heading, i) => (
                    <li key={i} className="text-slate-700">• {heading}</li>
                  ))
                ) : (
                  <li className="text-slate-500">No headings found</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Email Addresses ({page.emails?.length || 0})
              </h3>
              {page.emails && page.emails.length > 0 ? (
                <ul className="space-y-1">
                  {page.emails.map((email, i) => (
                    <li key={i} className="text-slate-700">
                      <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                        {email}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">No email addresses found</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Text Content Preview</h3>
              <p className="text-slate-700 line-clamp-6">
                {page.textContent.substring(0, 500)}...
              </p>
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Internal Links ({page.links.internal.length})
              </h3>
              <ul className="space-y-1 max-h-64 overflow-y-auto">
                {page.links.internal.slice(0, 20).map((link, i) => (
                  <li key={i} className="text-sm text-slate-600 break-all">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                External Links ({page.links.external.length})
              </h3>
              <ul className="space-y-1 max-h-64 overflow-y-auto">
                {page.links.external.slice(0, 20).map((link, i) => (
                  <li key={i} className="text-sm text-slate-600 break-all">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-4">
            {siteTokens ? (
              <DesignTokensDisplay tokens={siteTokens} title="Site Design System" />
            ) : page.designTokens ? (
              <DesignTokensDisplay tokens={page.designTokens} title="Page Design Tokens" />
            ) : (
              <p className="text-slate-500">Design token extraction was disabled</p>
            )}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-4">
            {page.assets.favicon && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Favicon</h3>
                <img src={page.assets.favicon} alt="Favicon" className="w-8 h-8" />
                <p className="text-sm text-slate-600 mt-1">{page.assets.favicon}</p>
              </div>
            )}

            {page.assets.ogImage && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">OG Image</h3>
                <img src={page.assets.ogImage} alt="OG" className="max-w-sm border border-slate-300 rounded" />
                <p className="text-sm text-slate-600 mt-1">{page.assets.ogImage}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Logos ({page.assets.logos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {page.assets.logos.slice(0, 8).map((logo, i) => (
                  <div key={i} className="border border-slate-300 rounded p-2">
                    <img src={logo} alt={`Logo ${i + 1}`} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Images ({page.assets.images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {page.assets.images.slice(0, 12).map((image, i) => (
                  <div key={i} className="border border-slate-300 rounded p-2">
                    <img src={image} alt={`Image ${i + 1}`} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
