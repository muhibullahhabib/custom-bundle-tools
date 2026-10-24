import React, { type FC, useState, useEffect, useCallback, useRef } from 'react';
import { widget } from '@wix/editor';
import { httpClient } from '@wix/essentials';
import { SidePanel, WixDesignSystemProvider, Input, FormField, Checkbox, Text, Button } from '@wix/design-system';
import '@wix/design-system/styles.global.css';

type Trust = { image: string; title: string; description: string };
type Cat = { id: string; name: string };
type Prod = { id: string; name: string };
type TabId = 'design' | 'info' | 'categories' | 'cart';

const DEF_TRUST: Trust[] = [
  { image: '', title: 'FRI FRAKT', description: 'på alla 6-pack' },
  { image: '', title: 'NICKELHÅLLARE', description: 'värde 299 kr ingår' },
  { image: '', title: 'SÄKER BETALNING', description: 'Klarna, kort & Swish' },
  { image: '', title: 'ÄKTA BOTTICINO MARMOR', description: 'Handgjorda i Italien' },
];
const DEF: Record<string, string> = {
  'cards-per-row': '6', 'widget-max-height': '880',
  'card-border-color': '#2b2620', 'card-border-width': '1', 'card-border-style': 'solid', 'card-radius': '6',
  'shadow-angle': '180', 'shadow-distance': '14', 'shadow-size': '0', 'shadow-blur': '30',
  'shadow-opacity': '60', 'shadow-color': '#000000',
  'card-overlay': '75', 'card-ratio': '1.25',
  'card-text-color': '#f1ebe0', 'card-price-color': '#F28A3E',
  'price': '650', 'currency': 'kr',
  'categories-collection': 'Stores/Collections', 'category-name-field': 'name',
  'pack-product-id': '', 'pack-field-title': 'Pack Contents', 'category-id-field': '_id',
};

const Color: FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <FormField label={label}>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
        onChange={e => onChange(e.target.value)} style={{ width: 40, height: 32, border: 0, padding: 0 }} />
      <Input value={value} onChange={e => onChange(e.target.value)} />
    </div>
  </FormField>
);

/* ---------- slider with a value shown on the right (like the Wix shadow editor) ---------- */
const SliderRow: FC<{
  label: string; value: string; min: number; max: number; step?: number; unit?: string; onChange: (v: string) => void;
}> = ({ label, value, min, max, step = 1, unit, onChange }) => {
  const n = parseFloat(value);
  const safe = isNaN(n) ? min : Math.min(max, Math.max(min, n));
  return (
    <div style={{ padding: '4px 0 10px' }}>
      <div style={{ fontSize: 13, color: '#32536a', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input type="range" min={min} max={max} step={step} value={safe}
          onChange={e => onChange(e.target.value)}
          style={{ flex: 1, minWidth: 0, accentColor: '#116dff', cursor: 'pointer' }} />
        <span style={{ width: 44, textAlign: 'right', fontSize: 16, color: '#162d3d' }}>{safe}{unit || ''}</span>
      </div>
    </div>
  );
};

/* ---------- round angle dial: drag the handle. 0 = up, 90 = right, 180 = down, 270 = left ---------- */
const AngleDial: FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const n = parseFloat(value);
  const a = isNaN(n) ? 0 : ((n % 360) + 360) % 360;
  const R = 26; // handle distance from the center (px)
  const rad = (a * Math.PI) / 180;

  const fromPointer = (e: React.PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    onChange(String(Math.round(deg)));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 12px' }}>
      <div
        ref={ref}
        onPointerDown={e => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); fromPointer(e); }}
        onPointerMove={e => { if (e.buttons === 1) fromPointer(e); }}
        style={{
          position: 'relative', width: 64, height: 64, borderRadius: '50%', background: '#fff',
          border: '4px solid #e1e6ec', boxSizing: 'border-box', cursor: 'pointer', touchAction: 'none',
        }}>
        {/* line from the center to the handle */}
        <div style={{
          position: 'absolute', left: '50%', bottom: '50%', width: 2, height: R, background: '#b8c4d0',
          transformOrigin: 'bottom center', transform: `translateX(-1px) rotate(${a}deg)`,
        }} />
        {/* handle */}
        <div style={{
          position: 'absolute', width: 12, height: 12, borderRadius: '50%', background: '#fff',
          border: '2px solid #116dff', boxSizing: 'border-box',
          left: `calc(50% + ${Math.sin(rad) * R}px)`, top: `calc(50% - ${Math.cos(rad) * R}px)`,
          transform: 'translate(-50%, -50%)',
        }} />
      </div>
      <div style={{ width: 96 }}>
        <Input value={String(Math.round(a))} suffix={<Input.Affix>°</Input.Affix>}
          onChange={e => { const v = parseFloat(e.target.value); onChange(isNaN(v) ? '0' : String(Math.min(360, Math.max(0, v)))); }} />
      </div>
    </div>
  );
};

/* ---------- simple inline SVG icons (no extra package needed) ---------- */
const Svg: FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const ICONS: Record<TabId, React.ReactNode> = {
  design: (<Svg><path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.6-.2-1-.5-1.4-.3-.4-.5-.8-.5-1.4 0-1.1.9-2 2-2h2.3A3.7 3.7 0 0 0 21 10.5C21 6.4 16.9 3 12 3z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10.5" cy="7" r="1" /><circle cx="15.5" cy="7.5" r="1" /></Svg>),
  info: (<Svg><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></Svg>),
  categories: (<Svg><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Svg>),
  cart: (<Svg><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a1.5 1.5 0 0 0 1.5 1.1h8.4a1.5 1.5 0 0 0 1.5-1.1L21 7H6" /></Svg>),
};

const TABS: { id: TabId; label: string; sub: string }[] = [
  { id: 'design', label: 'Design', sub: 'Layout and product card style' },
  { id: 'info', label: 'Info Bar', sub: '4 items next to the search bar' },
  { id: 'categories', label: 'Categories', sub: 'Source and visible categories' },
  { id: 'cart', label: 'Cart & Price', sub: 'Pack product and price text' },
];

const Section: FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <div style={{ padding: '4px 0 12px', borderBottom: '1px solid #e5e7eb', marginBottom: 12 }}>
    <SidePanel.Field><Text weight="bold">{title}</Text></SidePanel.Field>
    {hint && <SidePanel.Field><Text size="tiny" secondary>{hint}</Text></SidePanel.Field>}
    {children}
  </div>
);

/* ---------- vertical accordion card ---------- */
const NavCard: FC<{
  id: TabId; label: string; sub: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}> = ({ id, label, sub, open, onToggle, children }) => (
  <div style={{
    background: '#fff', borderRadius: 10, marginBottom: 10, overflow: 'hidden',
    border: open ? '1px solid #116dff' : '1px solid #e1e6ec',
    boxShadow: open ? '0 4px 14px rgba(17,109,255,0.12)' : '0 1px 2px rgba(22,45,61,0.06)',
    transition: 'box-shadow .2s, border-color .2s',
  }}>
    <button type="button" onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        background: open ? '#f4f8ff' : '#fff', border: 0, cursor: 'pointer', textAlign: 'left',
      }}>
      <span style={{
        width: 36, height: 36, borderRadius: 9, flex: '0 0 36px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: open ? '#116dff' : '#eef3fa', color: open ? '#fff' : '#32536a',
        transition: 'background .2s, color .2s',
      }}>{ICONS[id]}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#162d3d' }}>{label}</span>
        <span style={{ display: 'block', fontSize: 12, color: '#6b7f8f', marginTop: 2 }}>{sub}</span>
      </span>
      <span style={{
        color: '#32536a', display: 'flex', transition: 'transform .2s',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </span>
    </button>
    {open && <div style={{ padding: '14px 0 8px', borderTop: '1px solid #e8edf3' }}>{children}</div>}
  </div>
);

/* ---------- helper: POST to Wix REST API with auth ---------- */
const wixPost = async (url: string, body: any) => {
  const res = await httpClient.fetchWithAuth(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const txt = await res.text();
  let data: any = null; try { data = JSON.parse(txt); } catch {}
  if (!res.ok || !data) throw new Error(`REST ${url.split('/').slice(-3).join('/')} -> HTTP ${res.status} ${txt.replace(/\s+/g, ' ').slice(0, 140)}`);
  return data;
};

const Panel: FC = () => {
  const [s, setS] = useState<Record<string, string>>(DEF);
  const [trust, setTrust] = useState<Trust[]>(DEF_TRUST);
  const [cats, setCats] = useState<Cat[]>([]);
  const [prods, setProds] = useState<Prod[]>([]);
  const [prodErr, setProdErr] = useState('');
  const [visible, setVisible] = useState<string[] | null>(null); // null = all visible
  const [catErr, setCatErr] = useState('');
  const [tab, setTab] = useState<TabId | null>('design');

  useEffect(() => {
    (async () => {
      const next = { ...DEF };
      for (const k of Object.keys(DEF)) {
        const v = await widget.getProp(k).catch(() => null);
        if (v) next[k] = v;
      }
      setS(next);
      try { const t = JSON.parse((await widget.getProp('trust-items')) || ''); if (Array.isArray(t)) setTrust(t); } catch {}
      try { const v = JSON.parse((await widget.getProp('visible-categories')) || ''); if (Array.isArray(v)) setVisible(v); } catch {}
    })();
  }, []);

  // load the store products for the "6-Pack product" dropdown
  useEffect(() => {
    (async () => {
      try {
        const d = await wixPost('https://www.wixapis.com/stores/v1/products/query', { query: { paging: { limit: 100 } } });
        const list: Prod[] = (d.products || []).filter((p: any) => p.id && p.name).map((p: any) => ({ id: p.id, name: p.name }));
        console.log('[panel] products loaded:', list.length);
        setProds(list);
        if (!list.length) setProdErr('No store products found.');
      } catch (e: any) {
        console.warn('[panel] products failed:', e);
        setProdErr(String((e && e.message) || e));
      }
    })();
  }, []);

  // reload the category list whenever the collection ID, name field or ID field changes
  useEffect(() => {
    const coll = s['categories-collection'] || 'Stores/Collections';
    const nameF = s['category-name-field'] || 'name';
    const idF = s['category-id-field'] || '_id';

    // Option A: call the Wix REST API directly (no dev-server endpoint needed)
    const viaRest = async (): Promise<Cat[]> => {
      if (coll === 'Stores/Collections') {
        const d = await wixPost('https://www.wixapis.com/stores/v1/collections/query', { query: { paging: { limit: 100 } } });
        return (d.collections || []).filter((c: any) => c.name).map((c: any) => ({ id: c.id, name: c.name }));
      }
      const d = await wixPost('https://www.wixapis.com/wix-data/v2/items/query', { dataCollectionId: coll, query: { paging: { limit: 100 } } });
      return (d.dataItems || [])
        .map((it: any) => ({ id: idF === '_id' ? it.id : it.data?.[idF], name: it.data?.[nameF] }))
        .filter((c: any) => c.id && c.name);
    };

    // Option B: the endpoint in src/pages/api/categories.ts
    const viaEndpoint = async (): Promise<Cat[]> => {
      const base = String(import.meta.env.BASE_API_URL || '');
      const qs = `collection=${encodeURIComponent(coll)}&field=${encodeURIComponent(nameF)}&idfield=${encodeURIComponent(idF)}`;
      const res = await httpClient.fetchWithAuth(`${base}/api/categories?${qs}`);
      const txt = await res.text();
      let data: any = null; try { data = JSON.parse(txt); } catch {}
      if (!Array.isArray(data)) throw new Error(`endpoint -> HTTP ${res.status} ${data && data.error ? data.error : txt.replace(/\s+/g, ' ').slice(0, 100)}`);
      return data;
    };

    const t = setTimeout(async () => {
      setCatErr('');
      const errors: string[] = [];
      for (const [label, fn] of [['REST', viaRest], ['endpoint', viaEndpoint]] as const) {
        try {
          const list = await fn();
          console.log(`[panel] categories loaded via ${label}:`, list.length);
          setCats(list);
          if (!list.length) setCatErr('The collection returned no categories. Check the collection ID and field IDs.');
          return;
        } catch (e: any) { errors.push(String((e && e.message) || e)); console.warn('[panel]', label, 'failed:', e); }
      }
      setCats([]); setCatErr(errors.join('  |  '));
    }, 500);
    return () => clearTimeout(t);
  }, [s['categories-collection'], s['category-name-field'], s['category-id-field']]);

  const set = useCallback((k: string, v: string) => { setS(p => ({ ...p, [k]: v })); widget.setProp(k, v); }, []);
  const setTrustItem = (i: number, f: keyof Trust, v: string) => {
    const n = trust.map((t, j) => (j === i ? { ...t, [f]: v } : t));
    setTrust(n); widget.setProp('trust-items', JSON.stringify(n));
  };
  const saveVisible = (v: string[] | null) => { setVisible(v); widget.setProp('visible-categories', v ? JSON.stringify(v) : ''); };
  const isOn = (id: string) => (visible ? visible.includes(id) : true);
  const toggle = (id: string) => {
    const cur = visible ? visible : cats.map(c => c.id);
    saveVisible(cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]);
  };

  const packId = s['pack-product-id'];
  const packInList = !packId || prods.some(p => p.id === packId);

  const content: Record<TabId, React.ReactNode> = {
    design: (
      <>
        <Section title="Layout">
          <SidePanel.Field>
            <FormField label="Cards per row (desktop)">
              <Input type="number" min={2} max={8} value={s['cards-per-row']} onChange={e => set('cards-per-row', e.target.value)} />
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field>
            <FormField label="Widget max height (px, desktop)" infoContent="The widget never gets taller than this on desktop. The product area scrolls inside it. Not used on mobile.">
              <Input type="number" min={300} max={3000} value={s['widget-max-height']} onChange={e => set('widget-max-height', e.target.value)} />
            </FormField>
          </SidePanel.Field>
        </Section>
        <Section title="Product card" hint="The product image is the card background. Name and price are shown on top of it.">
          <SidePanel.Field>
            <FormField label="Card height ratio" infoContent="Height divided by width. 1 = square, 1.25 = a bit taller, 1.5 = tall.">
              <Input type="number" min={0.5} max={3} step={0.05} value={s['card-ratio']} onChange={e => set('card-ratio', e.target.value)} />
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field>
            <FormField label="Dark overlay at the bottom (0-100)" infoContent="Makes the name and price easier to read on the image.">
              <Input type="number" min={0} max={100} value={s['card-overlay']} onChange={e => set('card-overlay', e.target.value)} />
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field><Color label="Name color" value={s['card-text-color']} onChange={v => set('card-text-color', v)} /></SidePanel.Field>
          <SidePanel.Field><Color label="Price color" value={s['card-price-color']} onChange={v => set('card-price-color', v)} /></SidePanel.Field>
        </Section>
        <Section title="Card shadow" hint="Angle: 0 = up, 90 = right, 180 = down, 270 = left. Set opacity to 0 for no shadow.">
          <SidePanel.Field>
            <div style={{ fontSize: 13, color: '#32536a' }}>Angle</div>
            <AngleDial value={s['shadow-angle']} onChange={v => set('shadow-angle', v)} />
          </SidePanel.Field>
          <SidePanel.Field><SliderRow label="Distance (px)" value={s['shadow-distance']} min={0} max={100} onChange={v => set('shadow-distance', v)} /></SidePanel.Field>
          <SidePanel.Field><SliderRow label="Size (px)" value={s['shadow-size']} min={-20} max={50} onChange={v => set('shadow-size', v)} /></SidePanel.Field>
          <SidePanel.Field><SliderRow label="Blur" value={s['shadow-blur']} min={0} max={100} onChange={v => set('shadow-blur', v)} /></SidePanel.Field>
          <SidePanel.Field>
            <SliderRow label="Opacity" value={s['shadow-opacity']} min={0} max={100} unit="%" onChange={v => set('shadow-opacity', v)} />
          </SidePanel.Field>
          <SidePanel.Field><Color label="Shadow color" value={s['shadow-color']} onChange={v => set('shadow-color', v)} /></SidePanel.Field>
        </Section>
        <Section title="Card border">
          <SidePanel.Field><Color label="Border color" value={s['card-border-color']} onChange={v => set('card-border-color', v)} /></SidePanel.Field>
          <SidePanel.Field>
            <FormField label="Border thickness (px)">
              <Input type="number" min={0} max={10} value={s['card-border-width']} onChange={e => set('card-border-width', e.target.value)} />
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field>
            <FormField label="Border style">
              <select value={s['card-border-style']} onChange={e => set('card-border-style', e.target.value)} style={{ width: '100%', height: 36 }}>
                {['solid', 'dashed', 'dotted', 'double', 'none'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field>
            <FormField label="Corner radius (px)">
              <Input type="number" min={0} max={30} value={s['card-radius']} onChange={e => set('card-radius', e.target.value)} />
            </FormField>
          </SidePanel.Field>
        </Section>
      </>
    ),
    info: (
      <Section title="Info items" hint="Shown to the left of the search bar. Each item has an image, a title and a description.">
        {trust.map((t, i) => (
          <div key={i} style={{ borderTop: i ? '1px solid #eef1f4' : 0, paddingTop: i ? 12 : 0, marginTop: i ? 12 : 0 }}>
            <SidePanel.Field><Text weight="bold" size="small">Item {i + 1}</Text></SidePanel.Field>
            <SidePanel.Field><FormField label="Image URL"><Input value={t.image} onChange={e => setTrustItem(i, 'image', e.target.value)} /></FormField></SidePanel.Field>
            <SidePanel.Field><FormField label="Title"><Input value={t.title} onChange={e => setTrustItem(i, 'title', e.target.value)} /></FormField></SidePanel.Field>
            <SidePanel.Field><FormField label="Description"><Input value={t.description} onChange={e => setTrustItem(i, 'description', e.target.value)} /></FormField></SidePanel.Field>
          </div>
        ))}
      </Section>
    ),
    categories: (
      <>
        <Section title="Categories source" hint="Where the category list comes from.">
          <SidePanel.Field>
            <FormField label="Categories collection ID" infoContent="Default: Stores/Collections (your store categories)">
              <Input value={s['categories-collection']} onChange={e => set('categories-collection', e.target.value)} />
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field>
            <FormField label="Category name field ID">
              <Input value={s['category-name-field']} onChange={e => set('category-name-field', e.target.value)} />
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field>
            <FormField label="Category ID field" infoContent="The field that holds the store category ID (the ID that products belong to). Use _id if the item's own ID is the category ID.">
              <Input value={s['category-id-field']} onChange={e => set('category-id-field', e.target.value)} />
            </FormField>
          </SidePanel.Field>
        </Section>
        <Section title="Categories to show" hint="Tick the categories that should appear in the builder.">
          {catErr && <SidePanel.Field><Text skin="error" size="small">{catErr}</Text></SidePanel.Field>}
          <SidePanel.Field>
            <Button size="tiny" onClick={() => saveVisible(cats.map(c => c.id))}>Select all</Button>{' '}
            <Button size="tiny" priority="secondary" onClick={() => saveVisible([])}>Select none</Button>
          </SidePanel.Field>
          {cats.map(c => (
            <SidePanel.Field key={c.id}>
              <Checkbox checked={isOn(c.id)} onChange={() => toggle(c.id)}>{c.name}</Checkbox>
            </SidePanel.Field>
          ))}
        </Section>
      </>
    ),
    cart: (
      <>
        <Section title="Cart product" hint="The store product that is added to the cart for each 6-pack.">
          <SidePanel.Field>
            <FormField label="6-Pack product" infoContent="Choose your 'Custom 6-Pack' store product from the list.">
              <select value={packId} onChange={e => set('pack-product-id', e.target.value)} style={{ width: '100%', height: 36 }}>
                <option value="">— Choose a product —</option>
                {!packInList && <option value={packId}>Current ID: {packId}</option>}
                {prods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormField>
          </SidePanel.Field>
          {prodErr && <SidePanel.Field><Text skin="error" size="small">Could not load products. Use the ID field below. {prodErr}</Text></SidePanel.Field>}
          <SidePanel.Field>
            <FormField label="Product ID (manual)" infoContent="Filled automatically when you choose a product above. You can also paste an ID here.">
              <Input value={packId} onChange={e => set('pack-product-id', e.target.value)} />
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field>
            <FormField label="Custom text field title" infoContent="Must match the product's custom text field exactly">
              <Input value={s['pack-field-title']} onChange={e => set('pack-field-title', e.target.value)} />
            </FormField>
          </SidePanel.Field>
        </Section>
        <Section title="Bundle price (display)" hint="Only the text shown on the page. The real price comes from the store product.">
          <SidePanel.Field><FormField label="Price"><Input value={s['price']} onChange={e => set('price', e.target.value)} /></FormField></SidePanel.Field>
          <SidePanel.Field><FormField label="Currency"><Input value={s['currency']} onChange={e => set('currency', e.target.value)} /></FormField></SidePanel.Field>
        </Section>
      </>
    ),
  };

  return (
    <WixDesignSystemProvider>
      <SidePanel width="320" height="100vh">
        <SidePanel.Content noPadding>
          <div style={{ padding: 12, background: '#f7f9fc', minHeight: '100%' }}>
            {TABS.map(t => (
              <NavCard key={t.id} id={t.id} label={t.label} sub={t.sub}
                open={tab === t.id} onToggle={() => setTab(tab === t.id ? null : t.id)}>
                {content[t.id]}
              </NavCard>
            ))}
          </div>
        </SidePanel.Content>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};

export default Panel;