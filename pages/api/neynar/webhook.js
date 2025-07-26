
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { data, type } = req.body;

    if (type === 'cast.created' && data.text.includes('@watchthis')) {
      console.log('Received a @watchthis mention:', data);
      // In the future, we will process the mention here.
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
