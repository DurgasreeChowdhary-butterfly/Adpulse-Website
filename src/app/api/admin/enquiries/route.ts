import { NextResponse } from 'next/server';
import { listEnquiries, parseFilter } from '@/services/enquiries/admin';
import { pgCode } from '@/services/enquiries/store';

export const dynamic = 'force-dynamic';

/** GET /api/admin/enquiries?type=audit|newsletter&status=&q=&from=YYYY-MM-DD&to=YYYY-MM-DD  (admin only) */
export async function GET(req: Request) {
  const filter = parseFilter(req.url);
  if (!filter) return NextResponse.json({ error: 'Invalid filter' }, { status: 400 });
  try {
    return NextResponse.json(await listEnquiries(filter), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error(`[enquiries] list failed: ${pgCode(e)}`);
    return NextResponse.json({ error: 'Could not load enquiries. Check the database connection.' }, { status: 503 });
  }
}
