import { NextResponse } from 'next/server';
import { errorResponse, isCollectionKey, reorderItems } from '@/services/content/admin';

export const dynamic = 'force-dynamic';

/** PUT { order: [id, id, ...] } -> sets the display order of a list collection */
export async function PUT(req: Request, { params }: { params: { collection: string } }) {
  if (!isCollectionKey(params.collection)) return NextResponse.json({ error: 'Unknown collection' }, { status: 404 });
  const body = await req.json().catch(() => null);
  try {
    return NextResponse.json({ items: await reorderItems(params.collection, body?.order) });
  } catch (e) {
    const { status, body: err } = errorResponse(e);
    return NextResponse.json(err, { status });
  }
}
