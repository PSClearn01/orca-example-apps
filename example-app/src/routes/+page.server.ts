import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    subnets: db.getSubnets(),
    entities: db.getEntities(),
    allocations: db.getAllocations(),
    logs: db.getLogs()
  };
};
