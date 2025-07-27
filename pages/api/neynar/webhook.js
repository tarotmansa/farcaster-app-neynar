
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

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function checkAmbiguity(text) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that determines if a prediction is ambiguous. Respond with a score from 0 to 1, where 1 is highly ambiguous and 0 is not ambiguous at all. Only respond with the score.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0,
      max_tokens: 1,
    });
    return parseFloat(response.choices[0].message.content);
  } catch (error) {
    console.error('Error checking ambiguity:', error);
    return 1; // Assume ambiguous if there's an error
  }
}

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
        const ambiguityScore = await checkAmbiguity(data.text);
        console.log('Ambiguity score:', ambiguityScore);
        if (ambiguityScore > 0.7) {
          console.log('Prediction is too ambiguous');
        } else {
          console.log('Prediction is not ambiguous');
        }
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
