import { NextRequest, NextResponse } from 'next/server';

const AGENT_API_URL =
  process.env.VALIDATION_AGENT_URL ||
  process.env.ML_ASSISTANT_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const question = body?.question || body?.message || '';
    console.log('🔍 Proxying validation question to agent:', question);
    
    const response = await fetch(`${AGENT_API_URL}/questa/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: question,
        history: Array.isArray(body?.history) ? body.history : [],
      }),
    });

    if (!response.ok) {
      console.error('❌ Agent error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Agent returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Agent response received');
    
    return NextResponse.json({
      answer: data.reply || data.message || '',
      reply: data.reply || data.message || '',
      raw: data,
    });
  } catch (error: any) {
    console.error('❌ Error calling agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reach agent' },
      { status: 500 }
    );
  }
}
