import { NextResponse } from 'next/server';
import { deleteItem, errorResponse, getItem, isCollectionKey, updateItem } from '@/services/content/admin';

export const dynamic = 'force-dynamic';

/** `id` is the item's slug (services, case studies, insights) or its 1-based position (other lists). */
type Ctx = { params: Promise<{ collection: string; id: string }> };

const fail = (e: unknown) => {
  const { status, body } = errorResponse(e);
  return NextResponse.json(body, { status });
};
const unknown = () => NextResponse.json({ error: 'Unknown collection' }, { status: 404 });

export async function GET(_req: Request, { params: paramsPromise }: Ctx) {
  const params = await paramsPromise;
  if (!isCollectionKey(params.collection)) return unknown();
  try {
    return NextResponse.json(await getItem(params.collection, decodeURIComponent(params.id)));
  } catch (e) {
    return fail(e);
  }
}

/** PATCH { ...fields } -> merges the fields into the item */
export async function PATCH(req: Request, { params: paramsPromise }: Ctx) {
  const params = await paramsPromise;
  if (!isCollectionKey(params.collection)) return unknown();
  const patch = await req.json().catch(() => null);
  try {
    return NextResponse.json(await updateItem(params.collection, decodeURIComponent(params.id), patch));
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_req: Request, { params: paramsPromise }: Ctx) {
  const params = await paramsPromise;
  if (!isCollectionKey(params.collection)) return unknown();
  try {
    await deleteItem(params.collection, decodeURIComponent(params.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
