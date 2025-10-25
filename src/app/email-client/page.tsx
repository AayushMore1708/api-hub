'use client';

import { useState } from 'react';
import { sendEmail } from '@/services/emailService';

export default function EmailClient() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!to || !subject || !html) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    setLoading(true);
    const result = await sendEmail({ to, subject, html });
    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Email sent successfully!' });
      setTo('');
      setSubject('');
      setHtml('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to send email.' });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700 text-center">📧 Email Client (n8n)</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              placeholder="recipient@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Enter subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (HTML allowed)</label>
            <textarea
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 min-h-[80px]"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              required
              placeholder="<b>Hello world!</b>"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded bg-indigo-600 text-white font-semibold transition hover:bg-indigo-700 ${loading ? 'opacity-60 cursor-wait' : ''}`}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </form>
        {message && (
          <div className={`mt-5 px-4 py-3 rounded text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
      </div>
    </main>
  );
}
