import { NextResponse } from 'next/server';
import { errorResponse, isCollectionKey, readForAdmin, saveCollection } from '@/services/content/admin';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ collection: string }> };

const fail = (e: unknown) => {
  const { status, body } = errorResponse(e);
  return NextResponse.json(body, { status });
};

/** Admin read of a whole collection. Protected by proxy.ts. */
export async function GET(_req: Request, { params: paramsPromise }: Ctx) {
  const params = await paramsPromise;
  if (!isCollectionKey(params.collection)) return NextResponse.json({ error: 'Unknown collection' }, { status: 404 });
  try {
    return NextResponse.json(await readForAdmin(params.collection));
  } catch (e) {
    return fail(e);
  }
}

/** Admin save: replaces the whole collection (normalised + validated). Returns the stored version. */
export async function PUT(req: Request, { params: paramsPromise }: Ctx) {
  const params = await paramsPromise;
  const key = params.collection;
  if (!isCollectionKey(key)) return NextResponse.json({ error: 'Unknown collection' }, { status: 404 });
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return NextResponse.json({ error: 'Expected an object' }, { status: 422 });
  try {
    const clean = await saveCollection(key, data);
    return NextResponse.json({ ok: true, savedAt: new Date().toISOString(), data: clean });
  } catch (e) {
    return fail(e);
  }
}
