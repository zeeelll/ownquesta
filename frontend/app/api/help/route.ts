import { NextResponse } from 'next/server';

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      issueType: String(formData.get('issueType') ?? 'other').trim(),
      pageArea: String(formData.get('pageArea') ?? 'Other').trim(),
      severity: String(formData.get('severity') ?? 'medium').trim(),
      subject: String(formData.get('subject') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim(),
      stepsTried: String(formData.get('stepsTried') ?? '').trim(),
      submittedFrom: 'help_page',
      proofFiles: formData
        .getAll('proof')
        .filter((item): item is File => item instanceof File && item.size > 0)
        .map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
        })),
    };

    const response = await fetch(`${BACKEND_BASE}/api/help`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || '',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({
      success: false,
      error: 'Unable to submit the help request right now.',
    }));

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to submit the help request right now.',
      },
      { status: 500 },
    );
  }
}
