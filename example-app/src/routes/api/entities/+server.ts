import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async () => {
  return json(db.getEntities());
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const newEntity = db.addEntity(body);
    return json(newEntity, { status: 201 });
  } catch (e: any) {
    return json({ error: e.message || 'Invalid payload' }, { status: 400 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return json({ error: 'Entity ID required' }, { status: 400 });

    const updated = db.updateEntity(id, updates);
    if (!updated) return json({ error: 'Entity not found' }, { status: 404 });

    return json(updated);
  } catch (e: any) {
    return json({ error: e.message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Missing entity ID parameter' }, { status: 400 });

  const success = db.deleteEntity(id);
  if (!success) return json({ error: 'Entity not found' }, { status: 404 });

  return json({ success: true });
};
