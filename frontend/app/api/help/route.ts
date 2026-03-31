import { NextResponse } from 'next/server';

type StoredHelpTicket = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  issueType: string;
  pageArea: string;
  severity: string;
  subject: string;
  description: string;
  stepsTried: string;
  proofFiles: Array<{ name: string; size: number; type: string }>;
};

const helpTicketStore: StoredHelpTicket[] = [];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const issueType = String(formData.get('issueType') ?? 'other').trim();
    const pageArea = String(formData.get('pageArea') ?? 'Other').trim();
    const severity = String(formData.get('severity') ?? 'medium').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const stepsTried = String(formData.get('stepsTried') ?? '').trim();

    if (!name || !email || !subject || description.length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide your name, email, subject, and a clear issue description.',
        },
        { status: 400 },
      );
    }

    const proofFiles = formData
      .getAll('proof')
      .filter((item): item is File => item instanceof File && item.size > 0)
      .map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
      }));

    const ticketId = `OQ-HELP-${Date.now().toString(36).toUpperCase()}`;

    helpTicketStore.unshift({
      id: ticketId,
      createdAt: new Date().toISOString(),
      name,
      email,
      issueType,
      pageArea,
      severity,
      subject,
      description,
      stepsTried,
      proofFiles,
    });

    return NextResponse.json({
      success: true,
      ticketId,
      proofCount: proofFiles.length,
      message:
        proofFiles.length > 0
          ? `Help request submitted with ${proofFiles.length} proof file(s). Keep your ticket ID for reference.`
          : 'Help request submitted successfully. Keep your ticket ID for reference.',
    });
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
