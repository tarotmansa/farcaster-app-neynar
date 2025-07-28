import { getFrameHtmlResponse } from '@coinbase/onchainkit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const frame = getFrameHtmlResponse({
    buttons: [
      {
        label: 'TX details coming soon!',
      },
    ],
    image: `${process.env.NEXT_PUBLIC_HOST}/api/og?question=Transaction%20details%20are%20not%20yet%20implemented`,
    post_url: `${process.env.NEXT_PUBLIC_HOST}/api/tx`,
  });

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(frame);
}
