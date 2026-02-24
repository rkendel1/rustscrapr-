'use client';

import { useState } from 'react';

interface ScraperFormProps {
  onSubmit: (url: string, config: any) => void;
  loading: boolean;
}

export function ScraperForm({ onSubmit, loading }: ScraperFormProps) {
  const [url, setUrl] = useState('');
  const [crawlDepth, setCrawlDepth] = useState(1);
  const [maxPages, setMaxPages] = useState(5);
  const [extractDesignTokens, setExtractDesignTokens] = useState(true);
  const [summarizeBrand, setSummarizeBrand] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config = {
      crawlDepth,
      maxPages,
      extractDesignTokens,
      summarizeBrand,
    };
    
    onSubmit(url, config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">
          Website URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="crawlDepth" className="block text-sm font-medium text-slate-700 mb-1">
            Crawl Depth
          </label>
          <input
            type="number"
            id="crawlDepth"
            value={crawlDepth}
            onChange={(e) => setCrawlDepth(Number(e.target.value))}
            min="1"
            max="3"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="maxPages" className="block text-sm font-medium text-slate-700 mb-1">
            Max Pages
          </label>
          <input
            type="number"
            id="maxPages"
            value={maxPages}
            onChange={(e) => setMaxPages(Number(e.target.value))}
            min="1"
            max="20"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={extractDesignTokens}
            onChange={(e) => setExtractDesignTokens(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Extract Design Tokens</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={summarizeBrand}
            onChange={(e) => setSummarizeBrand(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">AI Brand Analysis</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Scraping...' : 'Scrape Website'}
      </button>
    </form>
  );
}
