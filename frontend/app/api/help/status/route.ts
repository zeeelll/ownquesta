import { NextResponse } from 'next/server';

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ticketId = String(url.searchParams.get('ticketId') || '').trim();
    const email = String(url.searchParams.get('email') || '').trim();

    if (!ticketId || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide ticket ID and email.',
        },
        { status: 400 },
      );
    }

    const backendUrl = new URL(`${BACKEND_BASE}/api/help/status`);
    backendUrl.searchParams.set('ticketId', ticketId);
    backendUrl.searchParams.set('email', email);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({
      success: false,
      error: 'Unable to fetch complaint status right now.',
    }));

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to fetch complaint status right now.',
      },
      { status: 500 },
    );
  }
}
