import { NextResponse } from 'next/server';
import { handleSubmission } from '@/services/enquiries/submit';

export const dynamic = 'force-dynamic';

/** Free growth audit form. Saves to the database first, then emails AdPulse. */
export async function POST(req: Request) {
  const { status, body } = await handleSubmission(req, 'audit');
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
