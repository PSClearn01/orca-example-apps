import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async () => {
  return json(db.getAllocations());
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const alloc = db.setIPAllocation(body);
    return json(alloc, { status: 200 });
  } catch (e: any) {
    return json({ error: e.message || 'Invalid allocation payload' }, { status: 400 });
  }
};
