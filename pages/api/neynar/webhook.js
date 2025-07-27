const axios = require('axios');

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

async function checkAmbiguity(text) {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that evaluates predictions for ambiguity. Your task is to return a JSON object with a single key, "score", which is a floating-point number between 0.0 and 1.0.

**Examples:**

*   **Prediction:** "@watchthis crypto goes up tomorrow"
    **Response:** {"score": 1.0}
*   **Prediction:** "@watchthis BTC will be over $70000 by tomorrow"
    **Response:** {"score": 0.0}

Now, analyze the following prediction and return only the JSON object:`
        },
        {
          role: 'user',
          content: `**Prediction:**\n${text}`
        }
      ],
      temperature: 0,
      max_tokens: 50,
      response_format: { type: "json_object" },
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const responseJson = JSON.parse(response.data.choices[0].message.content);
    const score = responseJson.score;
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

async function validateMarketRequest(mention) {
  // 1. Format validation
  if (!mention.text.startsWith('@watchthis')) {
    return { valid: false, error: 'Must start with @watchthis' };
  }

  if (INVALID_PATTERNS.some(pattern => pattern.test(mention.text))) {
    return { valid: false, error: 'Invalid format: subjective or vague terms' };
  }

  if (!VALID_PATTERNS.some(pattern => pattern.test(mention.text))) {
    return { valid: false, error: 'Invalid format: does not match any valid patterns' };
  }

  // 2. AI ambiguity check
  const ambiguityScore = await checkAmbiguity(mention.text);
  if (ambiguityScore > 0.7) {
    return { valid: false, error: `Prediction too vague. Ambiguity score: ${ambiguityScore}` };
  }

  return { valid: true, market: { text: mention.text, creator: mention.author.fid, channelId: mention.parent_url } };
}

import clientPromise from '../../../lib/mongodb';

async function saveMarket(market) {
  try {
    const client = await clientPromise;
    const db = client.db("iwager");
    const markets = db.collection("markets");
    const result = await markets.insertOne(market);
    console.log('Market saved to database:', result);
  } catch (error) {
    console.error('Error saving market to database:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { data, type } = req.body;

    if (type === 'cast.created' && data.text.includes('@watchthis')) {
      console.log('Received a @watchthis mention:', data);
      const validationResult = await validateMarketRequest(data);
      console.log('Validation result:', validationResult);
      if (validationResult.valid) {
        await saveMarket(validationResult.market);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
