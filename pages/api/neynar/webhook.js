
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

const axios = require('axios');

async function checkAmbiguity(text) {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that evaluates predictions for ambiguity. Your task is to return a single floating-point number between 0.0 and 1.0, where 0.0 means the prediction is not ambiguous and 1.0 means it is highly ambiguous. Return only the score.'
        },
        {
          role: 'user',
          content: `Here are some examples of predictions and their ambiguity scores:

*   **Prediction:** "@watchthis crypto goes up tomorrow"
    **Score:** 1.0
*   **Prediction:** "@watchthis I will be happy by Friday"
    **Score:** 1.0
*   **Prediction:** "@watchthis BTC will be over $70000 by tomorrow"
    **Score:** 0.0
*   **Prediction:** "@watchthis it will rain by 10h"
    **Score:** 0.0

Now, analyze the following prediction and return only the ambiguity score:

**Prediction:**
${text}`
        }
      ],
      temperature: 0,
      max_tokens: 1,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const score = parseFloat(response.data.choices[0].message.content);
    if (isNaN(score)) {
      console.error('OpenRouter response is not a number:', response.data.choices[0].message.content);
      return 1; // Assume ambiguous if the response is not a number
    }
    return score;
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
