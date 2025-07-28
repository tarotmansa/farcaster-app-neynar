import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import { getMarket } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { marketId } = req.query;

  if (!marketId) {
    return res.status(400).json({ error: 'Missing marketId' });
  }

  try {
    const market = await getMarket(marketId);

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    const frame = getFrameHtmlResponse({
      buttons: [
        {
          label: 'Bet YES ($5)',
        },
        {
          label: 'Bet NO ($5)',
        },
        {
          label: 'View Details',
        },
      ],
      image: `${process.env.NEXT_PUBLIC_HOST}/api/og?question=${encodeURIComponent(market.text)}`,
      post_url: `${process.env.NEXT_PUBLIC_HOST}/api/bet?marketId=${marketId}`,
    });

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(frame);
  } catch (error) {
    console.error('Error generating frame:', error);
    res.status(500).json({ error: 'Error generating frame' });
  }
}
