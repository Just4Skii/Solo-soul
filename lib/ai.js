/**
 * Gemini Flash helper with model fallback.
 * One dead model name should not take down captions or ticket checks.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const KEY = process.env.GEMINI_API_KEY || '';
const MODELS = [...new Set([
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
].filter(Boolean))];

export function geminiConfigured() { return Boolean(KEY); }

export async function generateText(prompt, { temperature = 0.7, maxOutputTokens = 500 } = {}) {
  if (!KEY) throw new Error('GEMINI_API_KEY not configured');
  const client = new GoogleGenerativeAI(KEY);
  let lastError = '';
  for (const modelName of MODELS) {
    try {
      const model = client.getGenerativeModel({ model: modelName, generationConfig: { temperature, maxOutputTokens } });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return { text, model: modelName };
      lastError = 'Empty response';
    } catch (error) {
      lastError = error.message;
      if (/leaked|API key|PERMISSION_DENIED|UNAUTHENTICATED/i.test(lastError)) break;
    }
  }
  throw new Error(lastError || 'Gemini request failed');
}
