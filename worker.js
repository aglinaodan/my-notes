// Cloudflare Worker — ESV API proxy
//
// Deploy with Wrangler CLI, or paste directly into the Cloudflare dashboard
// (Workers & Pages → Create → Edit code). Either way, set ESV_API_KEY as a
// Worker secret — do NOT hardcode it here.

const ESV_API_BASE = 'https://api.esv.org/v3/passage/text/';

// Replace with your app's actual origin once you know it, e.g.
// 'https://yourapp.web.app'. Using '*' for now so it works anywhere.
const ALLOWED_ORIGIN = '*';

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const reference = url.searchParams.get('q');

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Missing "q" query parameter (e.g. ?q=Genesis 1)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const params = new URLSearchParams({
      q: reference,
      'include-headings': 'false',
      'include-footnotes': 'false',
      'include-verse-numbers': 'true',
      'include-short-copyright': 'false',
      'include-passage-references': 'false',
      'indent-poetry': 'false',
      'indent-paragraphs': 'false',
    });

    try {
      const resp = await fetch(`${ESV_API_BASE}?${params}`, {
        headers: { Authorization: `Token ${env.ESV_API_KEY}` },
      });

      if (!resp.ok) {
        return new Response(
          JSON.stringify({ error: `ESV API returned ${resp.status}` }),
          { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Failed to reach ESV API' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },
};
