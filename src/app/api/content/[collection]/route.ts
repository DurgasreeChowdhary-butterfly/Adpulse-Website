import { NextResponse } from 'next/server';
import { getCollection, getInsightsContent, getTestimonials } from '@/services/content';
import { isCollectionKey } from '@/services/content/admin';

/**
 * Public, read-only content API: GET /api/content/services
 * Useful for a mobile app or another front end, and documents the shape a backend should return.
 */
export async function GET(_req: Request, { params: paramsPromise }: { params: Promise<{ collection: string }> }) {
  const params = await paramsPromise;
  if (!isCollectionKey(params.collection)) return NextResponse.json({ error: 'Unknown collection' }, { status: 404 });
  // Same filtering as the website: no draft articles, no hidden testimonials.
  if (params.collection === 'insights') return NextResponse.json(await getInsightsContent());
  if (params.collection === 'testimonials') return NextResponse.json(await getTestimonials());
  return NextResponse.json(await getCollection(params.collection));
}
