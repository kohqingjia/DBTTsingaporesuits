# Picadilly Tailors — AI-Powered Personal Styling Platform

An IS215 Digital Business Technologies and Transformation group project at SMU.

Digitalising **Picadilly Tailors** (est. 1930, Far East Plaza, Singapore) with an AI-powered bespoke suit styling experience built on Next.js and the OpenAI API.

---

## Features

| Feature | Description |
|---|---|
| **Occasion Selector** | Choose from Wedding, Corporate, Black Tie, Smart Casual, or Special Event to begin the styling journey |
| **AI Smart Stylist** | GPT-4o generates a full outfit recommendation (suit, shirt, tie, shoes) with colour palette, match score, and price estimate |
| **Budget Optimiser** | Finds the best value and premium outfit options within a given SGD budget |
| **AI Colour Analysis** | OpenAI Vision analyses a uploaded photo to recommend flattering suit and shirt colours based on skin tone |
| **Style Concierge Chatbot** | Floating chat widget for customer support — answers questions about the bespoke process, bookings, and the platform |
| **Customization Studio** | Interactive visual suit builder for lapels, linings, buttons, and more |
| **Sentiment Analytics** | Review sentiment dashboard powered by a Python ML pipeline |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **UI**: React 18, Tailwind CSS 3.4, Framer Motion 11
- **AI**: OpenAI API — GPT-4o / GPT-4o-mini (chat, styling), DALL-E 3 (image generation), Vision (colour analysis)
- **Analytics**: Python (pandas, scikit-learn, transformers) — see `analytics/`
- **Optional chatbot backend**: FastAPI (OpenAI-compatible `/v1` endpoint) — see `backend/`

---

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- An OpenAI API key (needs access to GPT-4o and DALL-E 3)
- Python 3.10+ (only required for the analytics pipeline or the FastAPI backend)

---

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd DBTTsingaporesuits
```

### 2. Install Node dependencies

```bash
npm install
```

### 3. Add your OpenAI API key

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local   # if the example exists, otherwise create manually
```

Open `.env.local` and add:

```
OPENAI_API_KEY=sk-...your-key-here...
```

> The key is only ever used server-side in the `/api/` routes — it is never exposed to the browser.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Main page — composes all sections
│   │   └── api/
│   │       ├── chat/route.ts         # Style Concierge chatbot endpoint
│   │       ├── stylist/route.ts      # AI outfit recommendation endpoint
│   │       ├── color-analysis/route.ts  # Skin tone / colour analysis endpoint
│   │       └── generate-image/route.ts  # DALL-E image generation endpoint
│   ├── components/
│   │   ├── ChatWidget.tsx            # Floating customer support chatbot
│   │   ├── AIStylist.tsx             # AI outfit recommendation UI
│   │   ├── OccasionSelector.tsx      # Occasion entry point
│   │   ├── AIColorAnalysis.tsx       # Colour analysis with photo upload
│   │   ├── CustomizationStudio.tsx   # Visual suit builder
│   │   ├── SentimentAnalytics.tsx    # Review analytics dashboard
│   │   ├── Hero.tsx
│   │   ├── Heritage.tsx
│   │   ├── Gallery.tsx
│   │   ├── CraftsmanshipSection.tsx
│   │   ├── BookingSection.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   └── CustomCursor.tsx
│   └── types/                        # Shared TypeScript interfaces
├── analytics/
│   ├── sentiment_analysis.py         # ML sentiment pipeline
│   ├── generate_dataset.py           # Review dataset generator
│   ├── reviews_dataset.csv           # Sample dataset
│   └── requirements.txt              # Python dependencies
├── backend/
│   ├── main.py                       # FastAPI app entry point
│   ├── chat_router.py                # OpenAI-compatible /v1 chat endpoint
│   └── requirements.txt             # Python dependencies
├── public/images/                    # Generated and static images
└── .env.local                        # API keys — never commit this file
```

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/chat` | POST | Style Concierge — conversational customer support |
| `/api/stylist` | POST | Full outfit recommendation from GPT-4o |
| `/api/color-analysis` | POST | Skin tone analysis via OpenAI Vision |
| `/api/generate-image` | POST | Image generation via DALL-E 3 |

All routes require `OPENAI_API_KEY` to be set in `.env.local`.

---

## Analytics Pipeline (Optional)

The sentiment analysis dashboard is powered by a separate Python pipeline.

```bash
cd analytics
pip install -r requirements.txt
python generate_dataset.py   # generates reviews_dataset.csv if needed
python sentiment_analysis.py
```

---

## FastAPI Chatbot Backend (Optional)

A standalone FastAPI server that exposes an OpenAI-compatible `/v1/chat/completions` endpoint. Use this if you want to connect an external client such as LibreChat to the Style Concierge.

```bash
cd backend
pip install -r requirements.txt
OPENAI_API_KEY=sk-...your-key... uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. The model ID to configure in your client is `picadilly-concierge`.

> The Next.js frontend does **not** depend on this server — it calls OpenAI directly via `/api/chat`. The FastAPI backend is for external integrations only.

---

## Build for Production

```bash
npm run build
npm start
```

Ensure `OPENAI_API_KEY` is set in your production environment variables (Vercel, Railway, etc.) — not in `.env.local`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI API key for all AI features |

---

## Notes

- All images should be placed in `public/images/` and referenced via the Next.js `Image` component
- The `.env.local` file is already in `.gitignore` — never commit your API key
- The site uses a strict dark luxury design system — refer to `CLAUDE.md` for colour tokens, typography rules, and component guidelines before making UI changes
