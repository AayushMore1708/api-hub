'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface NewsArticle {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

interface WorkflowResult {
  success: boolean;
  workflow: string;
  timestamp: string;
  data: {
    techNews: NewsArticle[];
    worldNews: NewsArticle[];
    summary: string;
    totalArticles: number;
  };
  email: {
    sent: boolean;
    to: string;
    error: string | null;
  } | null;
  error?: string;
}

export default function NewsWorkflowPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [categories, setCategories] = useState({
    tech: true,
    world: true,
  });
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const executeWorkflow = async () => {
    setLoading(true);
    setResult(null);

    try {
      const selectedCategories = Object.entries(categories)
        .filter(([_, enabled]) => enabled)
        .map(([category]) => category);

      const response = await fetch('/api/workflow/news-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: selectedCategories,
          sendEmail: emailEnabled,
          emailTo: emailAddress,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        workflow: 'news-summary',
        timestamp: new Date().toISOString(),
        data: {
          techNews: [],
          worldNews: [],
          summary: '',
          totalArticles: 0,
        },
        email: null,
        error: error.message || 'Failed to execute workflow',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            📰 News Summary Workflow
          </h1>
          <p className="text-xl text-gray-300">
            AI-powered news aggregation and summarization
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            ⚙️ Workflow Configuration
          </h2>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-white text-lg mb-3">
              Select News Categories:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={categories.tech}
                  onChange={(e) =>
                    setCategories({ ...categories, tech: e.target.checked })
                  }
                  className="w-5 h-5 accent-purple-500"
                />
                <span className="text-lg">💻 Tech News</span>
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={categories.world}
                  onChange={(e) =>
                    setCategories({ ...categories, world: e.target.checked })
                  }
                  className="w-5 h-5 accent-purple-500"
                />
                <span className="text-lg">🌍 World News</span>
              </label>
            </div>
          </div>

          {/* Email Options */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-white cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="w-5 h-5 accent-purple-500"
              />
              <span className="text-lg">📧 Send summary via email</span>
            </label>
            {emailEnabled && (
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
          </div>

          {/* Execute Button */}
          <button
            onClick={executeWorkflow}
            disabled={loading || (!categories.tech && !categories.world)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Executing Workflow...
              </span>
            ) : (
              '🚀 Execute Workflow'
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Status */}
            <div
              className={`p-6 rounded-xl border-2 ${
                result.success
                  ? 'bg-green-500/20 border-green-500'
                  : 'bg-red-500/20 border-red-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {result.success ? '✅' : '❌'}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {result.success
                      ? 'Workflow Completed Successfully'
                      : 'Workflow Failed'}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                  {result.error && (
                    <p className="text-red-300 mt-2">{result.error}</p>
                  )}
                </div>
              </div>
            </div>

            {result.success && (
              <>
                {/* AI Summary */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    🤖 AI Summary
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown className="text-gray-200 leading-relaxed">
                      {result.data.summary}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Tech News */}
                {result.data.techNews.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                      💻 Tech News ({result.data.techNews.length} articles)
                    </h2>
                    <div className="space-y-4">
                      {result.data.techNews.map((article, index) => (
                        <div
                          key={index}
                          className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-white mb-2">
                            <a
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-purple-400 transition-colors"
                            >
                              {article.title}
                            </a>
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">
                            {article.snippet}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Source: {article.source}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* World News */}
                {result.data.worldNews.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                      🌍 World News ({result.data.worldNews.length} articles)
                    </h2>
                    <div className="space-y-4">
                      {result.data.worldNews.map((article, index) => (
                        <div
                          key={index}
                          className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-white mb-2">
                            <a
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-purple-400 transition-colors"
                            >
                              {article.title}
                            </a>
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">
                            {article.snippet}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Source: {article.source}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Status */}
                {result.email && (
                  <div
                    className={`p-6 rounded-xl border-2 ${
                      result.email.sent
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-yellow-500/20 border-yellow-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {result.email.sent ? '📧' : '⚠️'}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {result.email.sent
                            ? `Email sent to ${result.email.to}`
                            : 'Email not sent'}
                        </h3>
                        {result.email.error && (
                          <p className="text-yellow-300 text-sm">
                            {result.email.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Workflow Description */}
        {!result && !loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">
              📋 Workflow Steps
            </h2>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-semibold">1.</span>
                <span>Fetch latest Tech News from Google Search API</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-semibold">2.</span>
                <span>Fetch latest World News from Google Search API</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-semibold">3.</span>
                <span>
                  Generate AI Summary using Google Gemini (gemini-1.5-flash)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-semibold">4.</span>
                <span>
                  (Optional) Send formatted summary via Gmail
                </span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
