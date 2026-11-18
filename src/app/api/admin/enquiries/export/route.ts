import { listEnquiries, parseFilter, toCsv } from '@/services/enquiries/admin';
import { pgCode } from '@/services/enquiries/store';

export const dynamic = 'force-dynamic';

/** GET /api/admin/enquiries/export?<same filters as the list>  -> CSV download (admin only) */
export async function GET(req: Request) {
  const filter = parseFilter(req.url);
  if (!filter) return new Response('Invalid filter', { status: 400 });
  try {
    const { items } = await listEnquiries({ ...filter, limit: 50_000 });
    const name = `adpulse-${filter.type ?? 'enquiries'}-${new Date().toISOString().slice(0, 10)}.csv`;
    return new Response(toCsv(items), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error(`[enquiries] export failed: ${pgCode(e)}`);
    return new Response('Could not export. Check the database connection.', { status: 503 });
  }
}
