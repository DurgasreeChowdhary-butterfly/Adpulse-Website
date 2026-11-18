import { NextResponse } from 'next/server';
import { createItem, errorResponse, isCollectionKey, listItems } from '@/services/content/admin';

export const dynamic = 'force-dynamic';

type Ctx = { params: { collection: string } };

const fail = (e: unknown) => {
  const { status, body } = errorResponse(e);
  return NextResponse.json(body, { status });
};

/** GET /api/admin/content/{collection}/items -> [{ id, position, item }] in display order */
export async function GET(_req: Request, { params }: Ctx) {
  if (!isCollectionKey(params.collection)) return NextResponse.json({ error: 'Unknown collection' }, { status: 404 });
  try {
    return NextResponse.json({ items: await listItems(params.collection) });
  } catch (e) {
    return fail(e);
  }
}

/** POST { item, position? } -> creates an item (position is 1-based; default: last) */
export async function POST(req: Request, { params }: Ctx) {
  if (!isCollectionKey(params.collection)) return NextResponse.json({ error: 'Unknown collection' }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Expected { "item": {...}, "position"?: number }' }, { status: 400 });
  try {
    const created = await createItem(params.collection, body.item, typeof body.position === 'number' ? body.position : undefined);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
