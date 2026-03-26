import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });

    const styledPrompt = `Editorial fashion photography, ${prompt}, cinematic lighting, dark moody background, luxury bespoke tailoring, shot on medium format film, shallow depth of field, high-end fashion magazine quality`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: styledPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const url = response.data?.[0]?.url;
    if (!url) throw new Error('No image URL returned');

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
