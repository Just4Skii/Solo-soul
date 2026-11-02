/**
 * Gemini Flash helper with model fallback.
 * Uses the REST API directly with a hard timeout so a slow model cannot hang a request.
 */
const KEY = process.env.GEMINI_API_KEY || '';
const MODELS = [...new Set([
  process.env.GEMINI_MODEL,
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest',
].filter(Boolean))];

export function geminiConfigured() { return Boolean(KEY); }

export async function generateText(prompt, { temperature = 0.7, maxOutputTokens = 500, timeoutMs = 20000 } = {}) {
  if (!KEY) throw new Error('GEMINI_API_KEY not configured');
  let lastError = '';
  for (const model of MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(KEY)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature, maxOutputTokens, ...(model.startsWith('gemini-3') ? { thinkingConfig: { thinkingBudget: 0 } } : {}) },
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
        if (text) return { text, model };
        lastError = 'Empty response';
      } else {
        lastError = data.error?.message || `HTTP ${res.status}`;
        if (/leaked|API key|PERMISSION_DENIED|UNAUTHENTICATED/i.test(lastError)) break;
      }
    } catch (error) {
      lastError = error.name === 'AbortError' ? `${model} timed out` : error.message;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(lastError || 'Gemini request failed');
}
