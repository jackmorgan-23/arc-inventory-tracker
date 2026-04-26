import * as ff from '@google-cloud/functions-framework';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const BUCKET_NAME = process.env.BUCKET_NAME || 'arc-raiders-item-cache-arc-492718';

ff.http('fnItems', async (req, res) => {
  // CORS configuration
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file('items_v2.json');
    
    // Set appropriate Cache-Control headers for Cloud CDN
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.set('Content-Type', 'application/json');

    // Stream the file directly to the response
    file.createReadStream()
      .on('error', (err) => {
        console.error('Error reading from GCS:', err);
        if (!res.headersSent) {
          res.status(500).send('Error reading items data');
        }
      })
      .pipe(res);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).send('Internal Server Error');
  }
});
