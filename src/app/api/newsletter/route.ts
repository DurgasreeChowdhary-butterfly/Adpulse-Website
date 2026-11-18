import { NextResponse } from 'next/server';
import { handleSubmission } from '@/services/enquiries/submit';

export const dynamic = 'force-dynamic';

/** Footer newsletter form. One active subscription per email address. */
export async function POST(req: Request) {
  const { status, body } = await handleSubmission(req, 'newsletter');
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
