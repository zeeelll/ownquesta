import { NextResponse } from 'next/server';

const BACKEND_BASE = 'http://localhost:5000';

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

    const text = await response.text();
    let data: { success?: boolean; error?: string; complaint?: unknown } = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {
        success: false,
        error:
          response.status === 404
            ? 'Complaint status endpoint is not active. Restart backend server and try again.'
            : 'Unable to fetch complaint status right now.',
      };
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Backend server is not reachable. Start/restart backend and try again.',
      },
      { status: 500 },
    );
  }
}
