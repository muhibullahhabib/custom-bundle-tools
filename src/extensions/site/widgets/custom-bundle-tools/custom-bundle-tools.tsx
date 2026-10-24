import { createClient } from '@wix/sdk';
import { site } from '@wix/site';
import { products, collections } from '@wix/stores';
import { items } from '@wix/data';

/* ------------ SET THESE ------------ */
const APP_ID = '6577d799-62d0-414c-ad31-a1db4a6ca461';               // from your app dashboard
const PAGE = 24, MAX_CHARS = 480, CART_TIMEOUT_MS = 20000;
const EVT_ADD_PACK = 'rcAddPack';                                    // event sent to the page code
const ATTR_RESULT = 'cart-result';                                   // attribute the page code sets back

const wix: any = createClient({
  auth: site.auth(),
  host: site.host({ applicationId: APP_ID }),
  modules: { products, collections, items },
});

const T = {
  title: 'DITT 6-PACK', ready: 'Ditt 6-pack är klart!', add: 'LÄGG I VARUKORG', adding: 'LÄGGER TILL…',
  reset: 'Rensa alla', all: 'VISA ALLA', more: 'Visa fler', choose: 'VÄLJ MOTIV', added: '✓ TILLAGD', addBtn: '+ LÄGG TILL',
  full: 'Ditt 6-pack är fullt. Ta bort ett motiv för att byta.', fail: 'Något gick fel. Dina val är kvar, försök igen.',
  ok: '6-pack tillagt i varukorgen', sel: 'valda', search: 'Sök motiv...', none: 'Inga motiv hittades.',
};
const DEF_TRUST = [
  { image: '', title: 'FRI FRAKT', description: 'på alla 6-pack' },
  { image: '', title: 'NICKELHÅLLARE', description: 'värde 299 kr ingår' },
  { image: '', title: 'SÄKER BETALNING', description: 'Klarna, kort & Swish' },
  { image: '', title: 'ÄKTA BOTTICINO MARMOR', description: 'Handgjorda i Italien' },
];

const CSS = `
:host{display:block;height:100%;--bg:#0a0908;--panel:#12100e;--line:#2b2620;--gold:#D96D15;--gold2:#F28A3E;--txt:#f1ebe0;--mute:#9a9185;--r:6px;--pos:50% 0%;--cols:6;
--card-bc:#2b2620;--card-bw:1px;--card-bs:solid;--card-r:6px;--card-shadow:0 14px 30px 0 rgba(0,0,0,.6);--ov:75;--tx:#f1ebe0;--ptx:#F28A3E;--ch:1.25}
*{box-sizing:border-box;margin:0}
.app{display:grid;grid-template-columns:1fr 340px;grid-template-rows:minmax(0,1fr);height:100%;overflow:hidden;background:var(--bg);color:var(--txt);font:14px/1.4 Inter,system-ui,sans-serif}
button{font:inherit;color:inherit;cursor:pointer;background:none;border:0}
.main{display:flex;flex-direction:column;overflow:hidden;min-width:0}
.head{flex:none;padding:18px 20px 0;border-bottom:1px solid var(--line)}
.sc{flex:1;min-height:0;overflow-y:auto;padding:16px 20px 24px;scrollbar-width:thin;scrollbar-color:var(--gold) #1a1612}
.sc::-webkit-scrollbar{width:8px}
.sc::-webkit-scrollbar-track{background:#1a1612;border-radius:4px}
.sc::-webkit-scrollbar-thumb{background:var(--gold);border-radius:4px}
.sc::-webkit-scrollbar-thumb:hover{background:var(--gold2)}
.trust{display:flex;align-items:center;gap:16px;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:14px}
.tl{display:flex;align-items:center;min-width:0;overflow:hidden}
.ti{display:flex;align-items:center;gap:12px;padding:0 20px;white-space:nowrap}.ti:first-child{padding-left:2px}.ti+.ti{border-left:1px solid #6a3a1a}
.ti img{width:34px;height:34px;object-fit:contain;flex:none}
.ti b{display:block;color:var(--gold2);font-size:12.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase}
.ti small{display:block;font-size:12.5px;opacity:.85}
.search{margin-left:auto;display:flex;align-items:center;gap:10px;background:#0d0b09;border:1px solid var(--gold);border-radius:30px;padding:0 16px;height:44px;width:230px;flex:none}
.search svg{width:20px;height:20px;flex:none;fill:none;stroke:var(--gold2);stroke-width:1.8;stroke-linecap:round}
.search input{flex:1;min-width:0;background:none;border:0;color:var(--txt);font:inherit;outline:0}
.catwrap{display:flex;align-items:flex-start;gap:8px}
.cats{flex:1;min-width:0;display:flex;gap:8px;overflow-x:auto;padding:2px 0 14px;scrollbar-width:none;scroll-behavior:smooth}.cats::-webkit-scrollbar{display:none}
.arr{flex:none;width:38px;height:38px;border-radius:50%;border:1px solid var(--gold);color:var(--gold2);background:var(--panel);font-size:22px;line-height:1;display:grid;place-items:center;padding-bottom:3px}.arr[hidden]{display:none}
.cat{flex:none;padding:9px 16px;border:1px solid var(--line);border-radius:var(--r);background:var(--panel);color:var(--mute);white-space:nowrap}
.cat.on{background:linear-gradient(#E8802F,#C25A0C);color:#1a1307;border-color:var(--gold);font-weight:600}
.grid{display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));gap:16px;padding:4px 2px 8px}
/* product card: the product image is the background, no card background */
.card{position:relative;aspect-ratio:1 / var(--ch);overflow:hidden;cursor:pointer;background:#1b1814;
 border:var(--card-bw) var(--card-bs) var(--card-bc);border-radius:var(--card-r);
 box-shadow:var(--card-shadow);
 transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-3px)}
.card.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset,var(--card-shadow)}
.card .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:var(--pos)}
.card .shade{position:absolute;inset:0;pointer-events:none;
 background:linear-gradient(to top,rgba(8,6,4,calc(var(--ov) / 100)) 0%,rgba(8,6,4,calc(var(--ov) / 220)) 42%,rgba(8,6,4,0) 72%)}
.info{position:absolute;left:0;right:0;bottom:0;padding:10px;display:flex;flex-direction:column;gap:6px}
.nm{font:600 16px/1.2 'Cormorant Garamond',serif;color:var(--tx);text-shadow:0 1px 6px rgba(0,0,0,.7)}
.pr{color:var(--ptx);font-size:13px;font-weight:600;text-shadow:0 1px 6px rgba(0,0,0,.7)}
.add{width:100%;padding:8px;border:1px solid rgba(255,255,255,.28);border-radius:4px;font-size:12px;letter-spacing:.04em;color:var(--tx);background:rgba(10,9,8,.55);backdrop-filter:blur(3px)}
.card.on .add{background:var(--gold);color:#1a1307;border-color:var(--gold);font-weight:600}
.chk{position:absolute;top:8px;right:8px;z-index:2;width:24px;height:24px;border-radius:50%;background:var(--gold);color:#1a1307;display:grid;place-items:center;font-weight:700;font-size:12px}
.more{display:block;margin:20px auto 0;padding:10px 26px;border:1px solid var(--gold);border-radius:var(--r);color:var(--gold2)}
.sk{pointer-events:none;box-shadow:none;background:linear-gradient(100deg,#1b1814 30%,#30281d 50%,#1b1814 70%);background-size:300% 100%;animation:sh 1.5s linear infinite}
@keyframes sh{from{background-position:100% 0}to{background-position:-100% 0}}
.empty{padding:40px;text-align:center;color:var(--mute)}
.panel{border-left:1px solid var(--line);background:var(--panel);padding:18px;display:flex;flex-direction:column;gap:14px;overflow-y:auto}
.ph{display:flex;justify-content:space-between;align-items:baseline}
.ph h2{font:600 22px 'Cormorant Garamond',serif;color:var(--gold2);letter-spacing:.04em}
.bar{height:5px;background:var(--line);border-radius:3px;overflow:hidden}.bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#C25A0C,#F28A3E);transition:width .25s}
.slots{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.slot{position:relative;aspect-ratio:1;border-radius:4px;border:1px dashed #6a3a1a;display:grid;place-items:center;color:var(--mute);font-size:11px;text-align:center}
.slot.f{border:1px solid #5a3418;box-shadow:0 6px 14px #0008;overflow:hidden}
.slot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:var(--pos)}
.slot .n{position:absolute;top:4px;left:4px;z-index:2;width:18px;height:18px;border-radius:50%;background:#000a;border:1px solid var(--gold);font-size:10px;display:grid;place-items:center;color:var(--gold2)}
.slot .x{position:absolute;top:3px;right:3px;z-index:2;width:22px;height:22px;border-radius:50%;background:#000b;font-size:14px;line-height:1}
.price{font:600 34px 'Cormorant Garamond',serif}
.cta{width:100%;padding:15px;border-radius:var(--r);background:linear-gradient(#E8802F,#C25A0C);color:#1a1307;font-weight:600;letter-spacing:.05em}
.cta:disabled{background:#2a251e;color:#6d655a;cursor:not-allowed}
.reset{color:var(--mute);font-size:12px;text-decoration:underline;align-self:center}
.ready{color:var(--gold2);font-size:13px;text-align:center;min-height:1.2em}
.mbar{display:none}
.toast{position:absolute;left:50%;bottom:90px;transform:translateX(-50%);background:#000e;border:1px solid var(--gold);padding:10px 16px;border-radius:var(--r);opacity:0;pointer-events:none;transition:opacity .2s;z-index:9;max-width:90%;text-align:center;color:var(--txt)}
.toast.s{opacity:1}
.wrap{position:relative;height:100%}
/* mobile layout (class set from the widget width) */
.m.app{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) auto}
.m .panel,.m .tl{display:none}
.m .trust{border:0;padding:0;margin-bottom:10px}.m .head{padding:12px 12px 0}.m .sc{padding:12px}
.m .search{width:100%;margin:0}.m .grid{gap:10px}
.m .nm{font-size:14px}.m .info{padding:8px;gap:4px}.m .add{padding:7px 4px;font-size:11px}
.m .mbar{display:block;background:var(--panel);border-top:1px solid var(--gold);padding:10px 12px}
.m .mrow{display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px}.m .mrow b{color:var(--gold2)}
.m .mslots{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:10px}
.m .mbar .slot .n,.m .mbar .slot .x{display:none}.m .mbar .cta{padding:13px}.m .toast{bottom:190px}
`;

const HTML = `<div class="wrap"><div class="app" id="app">
<section class="main"><div class="head">
 <div class="trust"><div class="tl" id="tl"></div><label class="search"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg><input id="q" type="search"></label></div>
 <div class="catwrap"><button class="arr" id="cl" hidden>‹</button><div class="cats" id="cats"></div><button class="arr" id="cr" hidden>›</button></div>
</div><div class="sc" id="sc"><div class="grid" id="grid"></div><button class="more" id="more" hidden></button><p class="empty" id="empty" hidden></p></div></section>
<aside class="panel"><div class="ph"><h2 id="pt"></h2><span id="cnt"></span></div><div class="bar"><i id="fill"></i></div>
<div class="slots" id="slots"></div><div class="ready" id="ready"></div><div class="price" id="price"></div>
<button class="cta" id="cta" disabled></button><button class="reset" id="reset"></button></aside>
<div class="mbar"><div class="mrow"><span id="mcnt"></span><b id="mprice"></b></div><div class="mslots" id="mslots"></div><button class="cta" id="mcta" disabled></button></div>
</div><div class="toast" id="toast"></div></div>`;

const esc = (s: any) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const sized = (u: string) => (!u ? '' : /\/v1\//.test(u) ? u : `${u}/v1/fit/w_500,h_800,q_80/image.jpg`);
const num = (v: string, d: number, min: number, max: number) => { const n = parseFloat(v); return Math.min(max, Math.max(min, isNaN(n) ? d : n)); };
// "#rrggbb" -> "r,g,b" (black if the value is not a valid 6-digit hex color)
const rgb = (hex: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m) return '0,0,0';
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

class BundleTools extends HTMLElement {
  static get observedAttributes() {
    return ['cards-per-row', 'widget-max-height', 'card-border-color', 'card-border-width', 'card-border-style', 'card-radius', 'shadow-angle', 'shadow-distance', 'shadow-size', 'shadow-blur', 'shadow-opacity', 'shadow-color', 'card-overlay', 'card-ratio', 'card-text-color', 'card-price-color', 'trust-items', 'visible-categories', 'price', 'currency', 'categories-collection', 'category-name-field', 'pack-product-id', 'pack-field-title', 'category-id-field', ATTR_RESULT];
  }
  accessTokenListener: any; r!: ShadowRoot; built = false; ro?: ResizeObserver;
  cats: { id: string; name: string }[] = []; cache: any = {}; byId: any = {}; picks: any[] = [];
  cat = ''; q = ''; busy = false; cols = 6; visible: string[] | null = null; timer: any;
  pending = false; cartTimer: any;

  constructor() { super(); this.accessTokenListener = wix.auth.getAccessTokenInjector(); this.r = this.attachShadow({ mode: 'open' }); }
  $ = (id: string) => this.r.getElementById(id) as HTMLElement & any;
  g = (n: string, d: string) => this.getAttribute(n) || d;

  connectedCallback() {
    if (this.built) return; this.built = true;
    this.r.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@400;500;600&display=swap');${CSS}</style>${HTML}`;
    this.wire(); this.apply();
    this.ro = new ResizeObserver(() => this.layout()); this.ro.observe(this);
    this.loadCats();
  }
  disconnectedCallback() { this.ro?.disconnect(); clearTimeout(this.cartTimer); }
  attributeChangedCallback(n: string, _old: string | null, val: string | null) {
    if (n === ATTR_RESULT) { this.onCartResult(val); return; }
    if (!this.built) return;
    if (n === 'categories-collection' || n === 'category-name-field' || n === 'category-id-field') { this.cats = []; this.cache = {}; this.byId = {}; this.cat = ''; this.loadCats(); return; }
    this.apply();
  }

  /* ---------- settings ---------- */
  apply() {
    const s = this.style;
    s.setProperty('--card-bc', this.g('card-border-color', '#2b2620'));
    s.setProperty('--card-bw', this.g('card-border-width', '1') + 'px');
    s.setProperty('--card-bs', this.g('card-border-style', 'solid'));
    s.setProperty('--card-r', this.g('card-radius', '6') + 'px');

    // card shadow: angle (0 = up, 90 = right, 180 = down, 270 = left), distance, size (spread), blur, opacity, color
    const ang = num(this.g('shadow-angle', '180'), 180, 0, 360) * Math.PI / 180;
    const dist = num(this.g('shadow-distance', '14'), 14, 0, 200);
    const size = num(this.g('shadow-size', '0'), 0, -50, 100);
    const blur = num(this.g('shadow-blur', '30'), 30, 0, 200);
    const op = num(this.g('shadow-opacity', '60'), 60, 0, 100) / 100;
    const sx = Math.round(Math.sin(ang) * dist * 100) / 100;
    const sy = Math.round(-Math.cos(ang) * dist * 100) / 100;
    s.setProperty('--card-shadow', `${sx}px ${sy}px ${blur}px ${size}px rgba(${rgb(this.g('shadow-color', '#000000'))},${op})`);

    s.setProperty('--ov', String(num(this.g('card-overlay', '75'), 75, 0, 100)));
    s.setProperty('--ch', String(num(this.g('card-ratio', '1.25'), 1.25, 0.5, 3)));
    s.setProperty('--tx', this.g('card-text-color', '#f1ebe0'));
    s.setProperty('--ptx', this.g('card-price-color', '#F28A3E'));
    this.cols = Math.max(1, parseInt(this.g('cards-per-row', '6')) || 6);
    let trust = DEF_TRUST; try { const t = JSON.parse(this.g('trust-items', '')); if (Array.isArray(t)) trust = t; } catch {}
    this.$('tl').innerHTML = trust.map((t: any) => `<div class="ti">${t.image ? `<img src="${esc(t.image)}" alt="">` : ''}<div><b>${esc(t.title)}</b><small>${esc(t.description)}</small></div></div>`).join('');
    this.visible = null; try { const v = JSON.parse(this.g('visible-categories', '')); if (Array.isArray(v)) this.visible = v; } catch {}
    const price = `6 för ${this.g('price', '650')} ${this.g('currency', 'kr')}`;
    this.$('price').textContent = this.$('mprice').textContent = price;
    this.$('pt').textContent = T.title; this.$('q').placeholder = T.search; this.$('reset').textContent = T.reset;
    this.$('more').textContent = T.more; this.$('empty').textContent = T.none;
    this.layout(); this.drawCats(); this.pack();
    const list = this.shown();
    if (list.length && !list.some(c => c.id === this.cat)) { this.cat = list[0].id; this.drawCats(); }
    if (this.cat && !this.cache[this.cat]) this.load(this.cat, 0);
    this.grid();
  }
  layout() {
    const w = this.clientWidth || 1000, m = w < 760;
    // fixed height on desktop (default 880px); on mobile the widget fills its container
    const mh = num(this.g('widget-max-height', '880'), 880, 300, 3000);
    this.style.height = m ? '' : mh + 'px';
    this.style.maxHeight = m ? 'none' : mh + 'px';
    this.$('app').classList.toggle('m', m);
    this.style.setProperty('--cols', String(m ? 2 : w < 1100 ? Math.min(this.cols, 3) : this.cols));
    this.arrows();
  }
  shown() {
    const all = this.visible ? this.cats.filter(c => this.visible!.includes(c.id)) : this.cats;
    return this.visible ? all : [{ id: 'ALL', name: T.all }, ...all];
  }

  /* ---------- data ---------- */
  async loadCats() {
    const coll = this.g('categories-collection', 'Stores/Collections'), nf = this.g('category-name-field', 'name'), idf = this.g('category-id-field', '_id');
    try {
      if (coll === 'Stores/Collections') {
        const r = await wix.collections.queryCollections().limit(100).find();
        this.cats = r.items.filter((c: any) => c.name).map((c: any) => ({ id: c._id, name: c.name }));
      } else {
        const r = await wix.items.query(coll).limit(100).find();
        this.cats = r.items.map((it: any) => { const d = it.data || it; return { id: d[idf] ?? it[idf], name: d[nf] ?? it[nf] }; }).filter((c: any) => c.id && c.name);
      }
    } catch (e) { console.error('[bundle] categories', e); this.toast(T.fail); }
    const list = this.shown(); if (!this.cat && list.length) this.cat = list[0].id;
    this.drawCats(); if (this.cat) this.load(this.cat, 0); this.grid();
  }
  async load(c: string, p: number) {
    const t = (this.cache[c] = this.cache[c] || { items: [], page: -1, more: false });
    if (t.loading) return; t.loading = true; if (c === this.cat) this.grid();
    try {
      let q = wix.products.queryProducts().ascending('name').limit(PAGE).skip(p * PAGE);
      if (c !== 'ALL') q = q.hasSome('collectionIds', [c]);
      const r = await q.find();
      r.items.filter((i: any) => i._id !== this.g('pack-product-id', '')).forEach((i: any) => {
        const image = sized(i.media?.mainMedia?.image?.url || '');
        if (!image || this.byId[i._id]) { if (this.byId[i._id]) t.items.push(this.byId[i._id]); return; }
        const d = { id: i._id, sku: i.sku || i._id, title: i.name, image, price: i.priceData?.formatted?.price || '' };
        this.byId[d.id] = d; t.items.push(d);
      });
      t.page = p; t.more = r.hasNext();
    } catch (e) { console.error('[bundle] products', e); this.toast(T.fail); }
    t.loading = false; if (c === this.cat) this.grid();
  }

  /* ---------- drawing ---------- */
  drawCats() {
    const el = this.$('cats'), sl = el.scrollLeft;
    el.innerHTML = this.shown().map(c => `<button class="cat${c.id === this.cat ? ' on' : ''}" data-c="${esc(c.id)}">${esc(c.name)}</button>`).join('');
    el.style.scrollBehavior = 'auto'; el.scrollLeft = sl; el.style.scrollBehavior = ''; setTimeout(() => this.arrows(), 60);
  }
  arrows() { const c = this.$('cats'); this.$('cl').hidden = c.scrollLeft < 4; this.$('cr').hidden = c.scrollLeft + c.clientWidth >= c.scrollWidth - 4; }
  grid() {
    const t = this.cache[this.cat] || { items: [], loading: true }, q = this.q;
    const l = t.items.filter((d: any) => !q || d.title.toLowerCase().includes(q));
    let sk = ''; if (t.loading) for (let k = 0; k < (l.length ? this.cols : this.cols * 2); k++) sk += '<div class="card sk"></div>';
    this.$('grid').innerHTML = l.map((d: any) => `<div class="card" data-id="${esc(d.id)}"><img class="bg" loading="lazy" src="${esc(d.image)}" alt="${esc(d.title)}"><div class="shade"></div><div class="info"><div class="nm">${esc(d.title)}</div>${d.price ? `<div class="pr">${esc(d.price)}</div>` : ''}<button class="add"></button></div></div>`).join('') + sk;
    this.$('more').hidden = !t.more || !!t.loading; this.$('empty').hidden = l.length > 0 || !!t.loading;
    this.paint();
  }
  paint() {
    Array.from(this.$('grid').children as any).forEach((c: any) => {
      if (c.classList.contains('sk')) return;
      const n = this.picks.filter(p => p.id === c.dataset.id).length; let k = c.querySelector('.chk');
      const btn = c.querySelector('.add');
      c.classList.toggle('on', n > 0); if (btn) btn.textContent = n ? T.added + (n > 1 ? ' ×' + n : '') : T.addBtn;
      if (n && !k) { k = document.createElement('span'); k.className = 'chk'; c.appendChild(k); }
      if (k) { if (n) k.textContent = n > 1 ? n : '✓'; else k.remove(); }
    });
  }
  slotHtml(i: number, m: boolean) {
    const p = this.picks[i];
    if (!p) return `<div class="slot">${m ? '+' : `<span class="n">${i + 1}</span><div>＋<br>${T.choose}</div>`}</div>`;
    return `<div class="slot f" data-i="${i}"><img src="${esc(p.image)}" alt="${esc(p.title)}">${m ? '' : `<span class="n">${i + 1}</span><button class="x" data-x="${i}">×</button>`}</div>`;
  }
  pack() {
    const n = this.picks.length; let h = '', m = '';
    for (let i = 0; i < 6; i++) { h += this.slotHtml(i, false); m += this.slotHtml(i, true); }
    this.$('slots').innerHTML = h; this.$('mslots').innerHTML = m;
    this.$('cnt').textContent = this.$('mcnt').textContent = `${n} / 6 ${T.sel}`;
    this.$('fill').style.width = (n / 6 * 100) + '%'; this.$('ready').textContent = n === 6 ? T.ready : '';
    this.$('cta').disabled = this.$('mcta').disabled = n !== 6 || this.busy;
    this.$('cta').textContent = this.$('mcta').textContent = this.busy ? T.adding : T.add;
    this.paint();
  }
  toast(m: string) { const t = this.$('toast'); t.textContent = m; t.className = 'toast s'; clearTimeout((t as any)._t); (t as any)._t = setTimeout(() => (t.className = 'toast'), 2600); }

  /* ---------- events ---------- */
  wire() {
    const on = (id: string, f: (e: any) => void) => (this.$(id).onclick = f);
    on('cats', e => { const b = e.target.closest('.cat'); if (!b) return; this.cat = b.dataset.c; this.drawCats(); if (!this.cache[this.cat]) this.load(this.cat, 0); this.grid(); this.$('sc').scrollTop = 0; });
    on('grid', e => { const c = e.target.closest('.card'); if (!c || !c.dataset.id || this.busy) return; if (this.picks.length >= 6) return this.toast(T.full); const d = this.byId[c.dataset.id]; if (d) { this.picks.push(d); this.pack(); } });
    on('cl', () => this.$('cats').scrollBy({ left: -this.$('cats').clientWidth * .8 }));
    on('cr', () => this.$('cats').scrollBy({ left: this.$('cats').clientWidth * .8 }));
    on('more', () => { const t = this.cache[this.cat]; this.load(this.cat, t.page + 1); });
    on('slots', e => { const x = e.target.closest('[data-x]'); if (x && !this.busy) { this.picks.splice(+x.dataset.x, 1); this.pack(); } });
    on('mslots', e => { const s = e.target.closest('.slot.f'); if (s && !this.busy) { this.picks.splice(+s.dataset.i, 1); this.pack(); } });
    on('reset', () => { if (!this.busy) { this.picks = []; this.pack(); } });
    on('cta', () => this.send()); on('mcta', () => this.send());
    this.$('cats').onscroll = () => this.arrows();
    this.$('q').oninput = (e: any) => { this.q = e.target.value.trim().toLowerCase(); this.grid(); };
  }

  /* ---------- add to cart (handled by Velo page code) ---------- */
  send() {
    if (this.busy || this.picks.length !== 6) return;
    const productId = this.g('pack-product-id', ''), fieldTitle = this.g('pack-field-title', 'Pack Contents');
    if (!productId) return this.toast('Set the 6-Pack product ID in the widget settings.');

    const o: any = {}; this.picks.forEach(p => { o[p.id] = o[p.id] || { name: p.title, sku: p.sku, qty: 0 }; o[p.id].qty++; });
    const items = Object.values(o) as any[];
    const packCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const build = (nm: boolean) => items.map(i => `${nm ? i.name + ' ' : ''}[${i.sku} x${i.qty}]`).join(' | ') + ` | Pack #${packCode}`;
    const summary = build(true).length <= MAX_CHARS ? build(true) : build(false);

    this.busy = true; this.pending = true; this.pack();
    // if the page code never answers, stop waiting
    clearTimeout(this.cartTimer);
    this.cartTimer = setTimeout(() => {
      if (!this.pending) return;
      console.error('[bundle] no answer from the page code. Is the Velo code added and the element ID correct?');
      this.pending = false; this.busy = false; this.toast(T.fail); this.pack();
    }, CART_TIMEOUT_MS);

    const detail = { productId, fieldTitle, summary, packCode };
    console.log('[bundle] sending to page code:', JSON.stringify(detail));
    this.dispatchEvent(new CustomEvent(EVT_ADD_PACK, { detail, bubbles: true, composed: true }));
  }
  onCartResult(val: string | null) {
    if (!val || !this.pending) return;
    let res: any = null; try { res = JSON.parse(val); } catch {}
    clearTimeout(this.cartTimer);
    this.pending = false; this.busy = false;
    if (res && res.ok) { this.picks = []; this.toast(T.ok); }
    else { console.error('[bundle] page code reported an error:', res && res.error); this.toast(T.fail); }
    this.pack();
  }
}

export default BundleTools;