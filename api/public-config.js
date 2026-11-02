/**
 * Public runtime configuration.
 * Only exposes values that are safe for the browser (Supabase URL + anon key,
 * and whether PayFast is live). Service keys never leave the server.
 */
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    payfastEnabled: Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY),
    payfastSandbox: process.env.PAYFAST_SANDBOX !== 'false',
    environment: process.env.VERCEL_ENV || 'development',
  });
}
