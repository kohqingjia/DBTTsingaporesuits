import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface StylistRequest {
  occasion: string;
  budget: number;
  style: string;
  requirements: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: StylistRequest = await req.json();
    const { occasion, budget, style, requirements } = body;

    const systemPrompt = `You are a master bespoke tailor at Picadilly Tailors, a luxury suit house in Singapore established in 1930.
You specialise in recommending complete bespoke outfits for discerning clients.
Always respond with a JSON object matching this exact schema — no markdown, no prose, only valid JSON:
{
  "recommendation": {
    "suit": { "description": string, "fabric": string, "colour": string, "hex": string, "price": number },
    "shirt": { "description": string, "colour": string, "hex": string, "price": number },
    "tie": { "description": string, "material": string, "colour": string, "hex": string, "price": number },
    "shoes": { "description": string, "colour": string, "hex": string, "price": number }
  },
  "palette": [
    { "name": string, "hex": string, "role": string }
  ],
  "styleExplanation": string,
  "matchScore": number,
  "totalPrice": number,
  "stylistNote": string
}
Prices should be in SGD. matchScore is 0-100. palette should have 4-5 colours. Keep all fields concise and elegant.`;

    const userPrompt = `Client brief:
- Occasion: ${occasion}
- Budget: SGD ${budget}
- Preferred style: ${style}
- Special requirements: ${requirements || 'None'}

Recommend the perfect bespoke outfit within the budget. Be precise and luxurious in your descriptions.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');

    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
