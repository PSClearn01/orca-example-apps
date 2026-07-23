import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async () => {
  return json(db.getSubnets());
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const newSubnet = db.addSubnet(body);
    return json(newSubnet, { status: 201 });
  } catch (e: any) {
    return json({ error: e.message || 'Invalid subnet payload' }, { status: 400 });
  }
};
