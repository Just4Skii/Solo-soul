/**
 * Gemini Ticket Search
 * /api/tickets/search — Smart search for event tickets using Gemini
 * Solo Soul Experiences — 2026-07-16
 *
 * When a ticket link is dead, this endpoint uses Gemini AI to search for
 * the correct ticket URL by understanding the event name and context.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAw6-NI38aZw-u1Ukrb7WWdy1xye81jW3k';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, eventTitle } = req.body || {};
  if (!query && !eventTitle) return res.status(400).json({ error: 'Either query or eventTitle required' });

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const searchFor = query || eventTitle;
    const prompt = `You are a ticket search assistant for Solo Soul Experiences in Durban, South Africa.

A user is looking for tickets to: "${searchFor}"

Please search your knowledge for the best website to buy tickets for this event in South Africa.
Consider these major South African ticket vendors:
- Webtickets (webtickets.co.za)
- Computicket (tickets.computicket.com)
- Ticketmaster SA
- The event's official website

Respond with ONLY a JSON object (no markdown, no backticks):
{
  "found": true or false,
  "suggestedUrl": "the best URL to buy tickets",
  "vendor": "webtickets / computicket / official / unknown",
  "confidence": 0-100,
  "notes": "helpful tip about finding tickets"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const json = JSON.parse(text.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim());

    return res.json({
      query: searchFor,
      result: json,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: err.message || 'Search failed' });
  }
}