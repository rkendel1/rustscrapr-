'use client';

import { useState } from 'react';
import { StartupsRipResult, StartupEntry } from '@/types';

export function StartupsRipScraper() {
  const [result, setResult] = useState<StartupsRipResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleScrape = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scrape-startups-rip', {
        method: 'GET',
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data: StartupsRipResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJson = () => {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `startups-rip-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredStartups = result?.startups.filter((s: StartupEntry) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.description || '').toLowerCase().includes(term) ||
      (s.industry || '').toLowerCase().includes(term) ||
      s.tags.some((t) => t.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            💀 startups.rip Scraper
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Scrape all startup data from{' '}
            <a
              href="https://startups.rip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              startups.rip
            </a>{' '}
            and download as JSON.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleScrape}
            disabled={loading}
            className="bg-rose-600 text-white py-2 px-5 rounded-lg font-medium hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Scraping…
              </span>
            ) : (
              'Scrape All Data'
            )}
          </button>

          {result && (
            <button
              onClick={handleDownloadJson}
              className="bg-emerald-600 text-white py-2 px-5 rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
            >
              ⬇ Download JSON
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
          <p className="mt-4 text-slate-600">
            Crawling startups.rip — this may take a minute…
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-rose-600">
                {result.totalStartups}
              </p>
              <p className="text-sm text-slate-600 mt-1">Startups</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-slate-900">
                {result.pagesScraped}
              </p>
              <p className="text-sm text-slate-600 mt-1">Pages Scraped</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-sm font-mono text-slate-700 break-all">
                {new Date(result.scrapedAt).toLocaleString()}
              </p>
              <p className="text-sm text-slate-600 mt-1">Scraped At</p>
            </div>
          </div>

          {/* Search filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by name, description, industry…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-slate-900 placeholder-slate-500"
            />
          </div>

          {/* Startups table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Industry</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Funding</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Shutdown</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStartups && filteredStartups.length > 0 ? (
                  filteredStartups.map((startup: StartupEntry, i: number) => (
                    <tr key={startup.url || `${startup.name}-${i}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap max-w-[180px] truncate">
                        {startup.url ? (
                          <a
                            href={startup.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            title={startup.name}
                          >
                            {startup.name}
                          </a>
                        ) : (
                          startup.name
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[280px]">
                        <span
                          className="line-clamp-2"
                          title={startup.description || undefined}
                        >
                          {startup.description || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {startup.industry || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {startup.totalFunding || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {startup.shutdownDate || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[160px]">
                        <div className="flex flex-wrap gap-1">
                          {startup.tags.slice(0, 3).map((tag, j) => (
                            <span
                              key={j}
                              className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      {searchTerm
                        ? 'No startups match your search.'
                        : 'No startups found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {searchTerm && filteredStartups && filteredStartups.length !== result.startups.length && (
            <p className="text-sm text-slate-500 text-center">
              Showing {filteredStartups.length} of {result.totalStartups} startups
            </p>
          )}
        </div>
      )}
    </div>
  );
}
