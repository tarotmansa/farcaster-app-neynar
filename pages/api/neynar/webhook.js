
export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Received POST request:', req.body);
    res.status(200).json({ message: 'POST request received' });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
