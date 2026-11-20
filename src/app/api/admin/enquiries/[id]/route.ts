import { NextResponse } from 'next/server';
import { enquiryStore, pgCode } from '@/services/enquiries/store';
import { statusUpdate } from '@/services/enquiries/validation';

export const dynamic = 'force-dynamic';

/** PATCH { status: "new" | "contacted" | "closed" }  (admin only) */
export async function PATCH(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const parsed = statusUpdate.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Status must be new, contacted or closed.' }, { status: 422 });
  try {
    const updated = await enquiryStore().setStatus(id, parsed.data.status);
    if (!updated) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes('active subscription')) return NextResponse.json({ error: msg }, { status: 409 });
    console.error(`[enquiries] status update failed: ${pgCode(e)}`);
    return NextResponse.json({ error: 'Could not update. Try again.' }, { status: 503 });
  }
}
