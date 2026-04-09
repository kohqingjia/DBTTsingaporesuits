"""
Picadilly Tailors — FastAPI backend
Exposes an OpenAI-compatible /v1 chat endpoint for the Style Concierge chatbot.

Run:
    uvicorn main:app --reload --port 8000

Then point LibreChat (or any OpenAI-compatible client) at:
    http://localhost:8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from chat_router import router

app = FastAPI(
    title="Picadilly Tailors — Style Concierge API",
    version="1.0.0",
)

# Allow the Next.js frontend (and LibreChat) to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
