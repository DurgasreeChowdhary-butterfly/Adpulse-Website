import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** POST /api/admin/revalidate — rebuilds every page (e.g. after `npm run db:restore`). Protected by proxy.ts. */
export async function POST() {
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
