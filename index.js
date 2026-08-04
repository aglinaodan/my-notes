const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

// Set this once via:
//   firebase functions:secrets:set ESV_API_KEY
const ESV_API_KEY = defineSecret('ESV_API_KEY');
const ESV_API_BASE = 'https://api.esv.org/v3/passage/text/';

// Allow only your app's origin. Replace with your actual hosting domain,
// or use '*' during local testing.
const ALLOWED_ORIGIN = '*';

exports.esvPassage = onRequest(
  { secrets: [ESV_API_KEY], cors: false, region: 'us-central1' },
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    const reference = req.query.q;
    if (!reference) {
      res.status(400).json({ error: 'Missing "q" query parameter (e.g. ?q=Genesis 1)' });
      return;
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
        headers: { Authorization: `Token ${ESV_API_KEY.value()}` },
      });

      if (!resp.ok) {
        res.status(resp.status).json({ error: `ESV API returned ${resp.status}` });
        return;
      }

      const data = await resp.json();
      res.status(200).json(data);
    } catch (err) {
      console.error('ESV API proxy error:', err);
      res.status(502).json({ error: 'Failed to reach ESV API' });
    }
  }
);
