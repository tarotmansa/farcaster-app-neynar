import { getFrameHtmlResponse } from '@coinbase/onchainkit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // For now, we'll just return a simple frame
  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: 'Betting coming soon!',
      },
    ],
    image: `${process.env.NEXT_PUBLIC_HOST}/api/og?question=Betting%20is%20not%20yet%20implemented`,
    post_url: `${process.env.NEXT_PUBLIC_HOST}/api/bet`,
  });

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(frame);
}
