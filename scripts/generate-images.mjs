// Run with: node scripts/generate-images.mjs
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import https from 'https';
import http from 'http';

const envPath = new URL('../.env.local', import.meta.url).pathname;
const envContent = readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/OPENAI_API_KEY\s*=\s*["']?([^"'\n]+)["']?/);
const OPENAI_API_KEY = apiKeyMatch?.[1]?.trim();

if (!OPENAI_API_KEY) {
  console.error('No OPENAI_API_KEY found in .env.local');
  process.exit(1);
}

const STYLE_PREFIX = 'Editorial fashion photography,';
const STYLE_SUFFIX = ', cinematic lighting, dark moody background, luxury bespoke tailoring, shot on medium format film, shallow depth of field, high-end fashion magazine quality';

const images = [
  // Occasion cards
  { filename: 'occasion-wedding.jpg',       prompt: 'groom in a white bespoke three-piece suit at a luxury wedding' },
  { filename: 'occasion-corporate.jpg',     prompt: 'businessman in a charcoal bespoke suit in a Singapore CBD office' },
  { filename: 'occasion-black-tie.jpg',     prompt: 'man in a black bespoke tuxedo at a formal gala evening' },
  { filename: 'occasion-smart-casual.jpg',  prompt: 'man in a navy blazer and tailored trousers in a modern setting' },
  { filename: 'occasion-special-event.jpg', prompt: 'man in a burgundy velvet bespoke suit at a special evening event' },

  // Gallery
  { filename: 'gallery-wedding.jpg',        prompt: 'groom in a cream ivory bespoke suit, full length portrait' },
  { filename: 'gallery-corporate.jpg',      prompt: 'executive in a pinstripe bespoke suit, confident stance' },
  { filename: 'gallery-evening.jpg',        prompt: 'man in a midnight blue double-breasted bespoke suit at evening' },
  { filename: 'gallery-casual.jpg',         prompt: 'man in a tan linen bespoke suit, relaxed outdoor setting' },
  { filename: 'gallery-tuxedo.jpg',         prompt: 'close detail of a black tie tuxedo lapel with silk pocket square' },
  { filename: 'gallery-grey.jpg',           prompt: 'man in grey herringbone bespoke suit walking in Singapore street' },
  { filename: 'gallery-atelier.jpg',        prompt: 'bespoke tailor workshop in Singapore with fabric bolts and sewing equipment' },

  // Heritage
  { filename: 'heritage-workshop.jpg',      prompt: 'vintage Singapore tailor workshop interior, 1950s, bolts of fine fabric' },
  { filename: 'heritage-fabric.jpg',        prompt: 'close-up of luxury wool suiting fabric texture with fine weave' },

  // Craftsmanship
  { filename: 'craft-stitching.jpg',        prompt: 'extreme close-up of hand basting stitches on a bespoke suit lapel' },
  { filename: 'craft-buttonhole.jpg',       prompt: 'extreme close-up of surgeon buttonholes on a suit sleeve, hand stitched' },
];

async function generateImage(prompt) {
  const fullPrompt = `${STYLE_PREFIX} ${prompt}${STYLE_SUFFIX}`;
  const body = JSON.stringify({
    model: 'dall-e-3',
    prompt: fullPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed.data[0].url);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = { chunks: [] };
    protocol.get(url, (res) => {
      res.on('data', chunk => file.chunks.push(chunk));
      res.on('end', async () => {
        const buffer = Buffer.concat(file.chunks);
        await writeFile(destPath, buffer);
        resolve();
      });
    }).on('error', reject);
  });
}

const outDir = new URL('../public/images/', import.meta.url).pathname;

for (const img of images) {
  const dest = `${outDir}${img.filename}`;
  console.log(`Generating: ${img.filename}…`);
  try {
    const url = await generateImage(img.prompt);
    await downloadImage(url, dest);
    console.log(`  Saved → ${img.filename}`);
  } catch (err) {
    console.error(`  FAILED: ${img.filename} — ${err.message}`);
  }
}

console.log('\nDone.');
