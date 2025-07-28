import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import { getMarket } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { marketId } = req.query;
  const { buttonIndex } = req.body.untrustedData;

  if (!marketId) {
    return res.status(400).json({ error: 'Missing marketId' });
  }

  try {
    const market = await getMarket(marketId);

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    let message = `You voted ${buttonIndex === 1 ? 'YES' : 'NO'} on "${market.text}"`;

    const frame = getFrameHtmlResponse({
      buttons: [
        {
          label: 'View TX',
        },
      ],
      image: `${process.env.NEXT_PUBLIC_HOST}/api/og?question=${encodeURIComponent(message)}`,
      post_url: `${process.env.NEXT_PUBLIC_HOST}/api/tx`,
    });

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(frame);
  } catch (error) {
    console.error('Error processing bet:', error);
    res.status(500).json({ error: 'Error processing bet' });
  }
}
