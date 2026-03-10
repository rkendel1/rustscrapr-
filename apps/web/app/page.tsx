'use client';

import { useState } from 'react';
import { ScraperForm } from '@/components/ScraperForm';
import { ResultTabs } from '@/components/ResultTabs';
import { StartupsRipScraper } from '@/components/StartupsRipScraper';
import { ScraperResult } from '@/types';

export default function Home() {
  const [result, setResult] = useState<ScraperResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async (url: string, config: any) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, config }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestDemo = async (config: any) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            🦀 Rust Web Scraper
          </h1>
          <p className="text-slate-600">
            AI-powered web scraping with design token extraction
          </p>
        </header>

        <div className="grid gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ScraperForm onSubmit={handleScrape} onTestDemo={handleTestDemo} loading={loading} />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          {loading && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Scraping website...</p>
            </div>
          )}

          {result && !loading && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ResultTabs result={result} />
            </div>
          )}
        </div>

        {/* startups.rip dedicated scraper */}
        <div className="mt-10 bg-white rounded-lg shadow-lg p-6">
          <StartupsRipScraper />
        </div>
      </div>
    </div>
  );
}
