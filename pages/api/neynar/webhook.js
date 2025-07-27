
const VALID_PATTERNS = [
  /^@watchthis .+ by (today|tomorrow|\d+h|\d+d|December \d+(st|nd|rd|th)?|January \d+(st|nd|rd|th)?)$/i,
  /^@watchthis .+ hits \$\d+k?(m|b)? by .+$/i,
  /^@watchthis .+ outperforms .+ (today|this week|this month)$/i
];

const INVALID_PATTERNS = [
  /\b(happy|sad|successful|good|bad)\b/i,  // subjective terms
  /\b(many|few|around|approximately)\b/i,  // vague quantities
  /\bif .+ then .+\b/i                     // conditional statements
];

function isValidFormat(text) {
  if (INVALID_PATTERNS.some(pattern => pattern.test(text))) {
    return false;
  }
  return VALID_PATTERNS.some(pattern => pattern.test(text));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { data, type } = req.body;

    if (type === 'cast.created' && data.text.includes('@watchthis')) {
      console.log('Received a @watchthis mention:', data);
      
      if (isValidFormat(data.text)) {
        console.log('Valid format');
      } else {
        console.log('Invalid format');
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
