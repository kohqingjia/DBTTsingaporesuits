import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const systemPrompt = `You are a professional colour consultant and master tailor at Picadilly Tailors.
Analyse the person's skin tone and undertone from the portrait photo provided.
Respond only with a valid JSON object matching this exact schema — no markdown, no prose:
{
  "skinTone": string (hex colour closest to the person's skin tone),
  "undertone": "warm" | "cool" | "neutral",
  "suits": [
    { "name": string, "hex": string },
    { "name": string, "hex": string },
    { "name": string, "hex": string }
  ],
  "shirts": [
    { "name": string, "hex": string },
    { "name": string, "hex": string },
    { "name": string, "hex": string }
  ],
  "ties": [
    { "name": string, "hex": string },
    { "name": string, "hex": string },
    { "name": string, "hex": string }
  ],
  "notes": string (2-3 sentences of personalised styling advice)
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: image, detail: 'low' },
            },
            {
              type: 'text',
              text: 'Analyse this portrait and recommend the ideal suit, shirt, and tie colours based on the person\'s skin tone and undertone.',
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 600,
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
