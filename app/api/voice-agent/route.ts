// app/api/voice-agent/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd", // Or "tts-1"
        voice: "nova",     // Available options: nova, echo, shimmer, etc.
        input: text,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const audio = await response.arrayBuffer();
    return new NextResponse(Buffer.from(audio), {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (err) {
    console.error("Voice agent error:", err);
    return NextResponse.json({ error: "Voice agent failed" }, { status: 500 });
  }
}
