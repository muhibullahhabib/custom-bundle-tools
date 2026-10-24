// Lists categories for the widget settings panel.
// ?collection=Stores/Collections (default) or your own CMS collection ID
// ?field=name (title field)  ?idfield=_id (field that holds the store category ID)
import type { APIRoute } from 'astro';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// try with elevated permissions first, then plain
async function run(elevate: any, fn: any, ...args: any[]) {
  try {
    return await elevate(fn)(...args);
  } catch (e) {
    console.warn('[categories] elevated call failed, retrying without elevation:', e);
    return await fn(...args);
  }
}

export const GET: APIRoute = async ({ url }) => {
  const coll = url.searchParams.get('collection') || 'Stores/Collections';
  const field = url.searchParams.get('field') || 'name';
  const idField = url.searchParams.get('idfield') || '_id';
  try {
    const { auth } = await import('@wix/essentials');
    let list: { id: string; name: string }[];

    if (coll === 'Stores/Collections') {
      const { collections } = await import('@wix/stores');
      const q = await run(auth.elevate, collections.queryCollections);
      const r = await q.limit(100).find();
      list = r.items.filter((c: any) => c.name).map((c: any) => ({ id: c._id, name: c.name }));
    } else {
      const { items } = await import('@wix/data');
      const q = await run(auth.elevate, items.query, coll);
      const r = await q.limit(100).find();
      list = r.items
        .map((it: any) => { const d = it.data || it; return { id: d[idField] ?? it[idField], name: d[field] ?? it[field] }; })
        .filter((c: any) => c.id && c.name);
    }
    return json(list);
  } catch (e: any) {
    console.error('[categories] failed:', e);
    return json({ error: String((e && e.message) || e) }, 500);
  }
};