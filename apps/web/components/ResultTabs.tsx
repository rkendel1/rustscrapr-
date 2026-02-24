'use client';

import { useState } from 'react';
import { ScraperResult } from '@/types';

interface ResultTabsProps {
  result: ScraperResult;
}

export function ResultTabs({ result }: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'links' | 'design' | 'assets'>('content');

  const page = result.pages[0];

  const tabs = [
    { id: 'content' as const, label: 'Content', icon: '📄' },
    { id: 'links' as const, label: 'Links', icon: '🔗' },
    { id: 'design' as const, label: 'Design Tokens', icon: '🎨' },
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
            {page.designTokens ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Colors ({page.designTokens.colors.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {page.designTokens.colors.map((color, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div
                          className="w-10 h-10 rounded border border-slate-300"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="text-xs">
                          <div className="font-mono text-slate-700">{color.value}</div>
                          <div className="text-slate-500">×{color.count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Font Families ({page.designTokens.fontFamilies.length})
                  </h3>
                  <ul className="space-y-1">
                    {page.designTokens.fontFamilies.map((font, i) => (
                      <li key={i} className="text-sm text-slate-700 font-mono">{font}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Font Sizes ({page.designTokens.fontSizes.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {page.designTokens.fontSizes.map((size, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 rounded text-sm font-mono text-slate-700">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Spacing ({page.designTokens.spacing.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {page.designTokens.spacing.map((space, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 rounded text-sm font-mono text-slate-700">
                        {space}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Border Radius ({page.designTokens.borderRadius.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {page.designTokens.borderRadius.map((radius, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 rounded text-sm font-mono text-slate-700">
                        {radius}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Shadows ({page.designTokens.shadows.length})
                  </h3>
                  <ul className="space-y-1">
                    {page.designTokens.shadows.map((shadow, i) => (
                      <li key={i} className="text-sm text-slate-700 font-mono">{shadow}</li>
                    ))}
                  </ul>
                </div>
              </>
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
