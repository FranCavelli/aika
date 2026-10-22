// Carrito (localStorage), filtros, pedido por WhatsApp y transiciones entre páginas.
import { muestra } from '../lib/colores';
type P = { fotosPorColor: boolean; id: string; nombre: string; categoria: string; precio: number; precioAnterior: number | null; descuento: number; stock: number; talles: string[]; colores: string[]; imagenes: string[]; descripcion: string };
type Item = { id: string; talle: string; color: string; cant: number };

const { productos, config } = JSON.parse(document.getElementById('datos-tienda')!.textContent!) as { productos: P[]; config: Record<string, string> };
const porId = new Map(productos.map(p => [p.id, p]));
const moneda = config.moneda || '$';
const $ = (s: string, r: ParentNode = document) => r.querySelector(s) as HTMLElement;
const plata = (n: number) => `${moneda}${n.toLocaleString('es-AR')}`;
const CLAVE = 'aika-bolsa';

let bolsa: Item[] = [];
try { bolsa = JSON.parse(localStorage.getItem(CLAVE) || '[]').filter((i: Item) => porId.has(i.id)); } catch {}
const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(bolsa)); } catch {} pintarBolsa(); };

const velo = $('.velo');
let origen: HTMLElement | null = null;
function abrir(panel: HTMLElement) {
  document.querySelectorAll<HTMLElement>('.panel.abierto').forEach(p => p !== panel && p.classList.remove('abierto'));
  if (!document.querySelector('.panel.abierto')) origen = document.activeElement as HTMLElement;
  velo.hidden = false; panel.classList.add('abierto'); panel.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  ($('.cerrar', panel) as HTMLButtonElement).focus();
}
function cerrar() {
  document.querySelectorAll<HTMLElement>('.panel.abierto').forEach(p => { p.classList.remove('abierto'); p.setAttribute('aria-hidden', 'true'); });
  velo.hidden = true; document.body.style.overflow = '';
  origen?.focus(); origen = null;
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });

const swatch = muestra;

document.addEventListener('click', e => {
  const t = e.target as HTMLElement;
  if (t.closest('[data-cerrar]')) { cerrar(); return; }
  if (t.closest('[data-abrir-bolsa]')) { e.preventDefault(); abrir($('#bolsa')); }
});

// Agregar desde la página de producto
document.addEventListener('aika:agregar', e => {
  const { id, talle, color, aviso } = (e as CustomEvent).detail as Item & { aviso: HTMLElement };
  const p = porId.get(id)!;
  const enBolsa = bolsa.filter(i => i.id === id).reduce((s, i) => s + i.cant, 0);
  if (enBolsa >= p.stock) { aviso.textContent = `Ya tenés todo el stock disponible (${p.stock}).`; return; }
  const ya = bolsa.find(i => i.id === id && i.talle === talle && i.color === color);
  ya ? ya.cant++ : bolsa.push({ id, talle, color, cant: 1 });
  guardar(); abrir($('#bolsa'));
});

// Transición entre páginas: la foto de la prenda "viaja" de la tarjeta a la página de producto y vuelve.
const VT = 'aika-vt';
document.addEventListener('click', e => {
  const card = (e.target as HTMLElement).closest<HTMLElement>('[data-producto]'); if (!card) return;
  document.querySelectorAll<HTMLElement>('[data-producto] img, [data-pp-foto]').forEach(x => x.style.viewTransitionName = 'none');
  const img = card.querySelector('img'); if (img) img.style.viewTransitionName = 'foto';
  try { sessionStorage.setItem(VT, card.dataset.producto!); } catch {}
});
document.addEventListener('astro:after-swap', () => {
  if (document.querySelector('[data-pp-foto]')) return;
  let id = ''; try { id = sessionStorage.getItem(VT) || ''; } catch {}
  const img = [...document.querySelectorAll<HTMLElement>(`[data-producto="${id}"] img`)].find(x => { const r = x.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
  if (!img) return;
  img.style.viewTransitionName = 'foto';
  setTimeout(() => { img.style.viewTransitionName = ''; }, 800);
});

// --- Bolsa ---
function pintarBolsa() {
  const b = $('#bolsa');
  const total = bolsa.reduce((s, i) => s + porId.get(i.id)!.precio * i.cant, 0);
  const cant = bolsa.reduce((s, i) => s + i.cant, 0);
  document.querySelectorAll<HTMLElement>('[data-contador]').forEach(c => { c.textContent = String(cant); c.hidden = !cant; });
  $('.bolsa-items', b).innerHTML = bolsa.map((i, n) => {
    const p = porId.get(i.id)!;
    const variante = [i.talle && `Talle ${i.talle}`, i.color && `<span class="punto" style="--c:${swatch(i.color)}"></span>`].filter(Boolean).join(' · ');
    return `<li><img src="${p.imagenes[0] || ''}" alt=""><div><p class="bi-nombre">${p.nombre}</p><p class="bi-var">${variante}</p>
      <div class="bi-cant"><button data-menos="${n}" aria-label="Quitar uno">−</button><span>${i.cant}</span><button data-mas="${n}" aria-label="Sumar uno">+</button></div></div><p class="bi-precio">${plata(p.precio * i.cant)}</p></li>`;
  }).join('');
  $('.bolsa-vacia', b).hidden = cant > 0; $('.bolsa-pie', b).hidden = !cant;
  $('.bolsa-total strong', b).textContent = plata(total);
  const gratis = Number(config.envio_gratis_desde || 0);
  $('.bolsa-envio', b).textContent = !gratis || !cant ? '' : total >= gratis ? 'Tenés envío gratis.' : `Te faltan ${plata(gratis - total)} para el envío gratis.`;
  const lineas = bolsa.map(i => { const p = porId.get(i.id)!; return `• ${i.cant} x ${p.nombre} (${p.id})${i.talle ? `, talle ${i.talle}` : ''}${i.color ? `, color ${i.color}` : ''}: ${plata(p.precio * i.cant)}`; });
  const msg = ['¡Hola! Quiero hacer este pedido en Aika:', ...lineas, `Total: ${plata(total)}`].join('\n');
  ($('.bolsa-wsp', b) as HTMLAnchorElement).href = `https://wa.me/${(config.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
}
$('#bolsa').addEventListener('click', e => {
  const t = (e.target as HTMLElement).closest('button'); if (!t) return;
  if (t.dataset.mas) { const i = bolsa[+t.dataset.mas]; if (bolsa.filter(x => x.id === i.id).reduce((s, x) => s + x.cant, 0) < porId.get(i.id)!.stock) i.cant++; guardar(); }
  if (t.dataset.menos) { const n = +t.dataset.menos; if (--bolsa[n].cant <= 0) bolsa.splice(n, 1); guardar(); }
});
pintarBolsa();

// La cabecera y el catálogo se reemplazan en cada navegación: se vuelven a enganchar en cada página.
document.addEventListener('astro:page-load', () => { pintarBolsa(); armarCatalogo(); });
document.addEventListener('click', e => document.querySelectorAll<HTMLDetailsElement>('[data-cat-menu][open]').forEach(m => { if (!m.contains(e.target as Node)) m.open = false; }));

// --- Filtros del catálogo ---
function armarCatalogo() {
  const catalogo = document.querySelector<HTMLElement>('[data-catalogo]');
  if (!catalogo) return;
  const estado: Record<string, string> = { cat: 'Todo', gen: 'Todo' };
  const aplicar = (animar = false) => {
    let visibles = 0;
    catalogo.querySelectorAll<HTMLElement>('[data-cat]').forEach(c => {
      const ok = (estado.cat === 'Todo' || c.dataset.cat === estado.cat) && (estado.gen === 'Todo' || c.dataset.gen === estado.gen || c.dataset.gen === 'Unisex');
      c.hidden = !ok;
      if (ok && animar) { c.classList.remove('entra'); void c.offsetWidth; c.style.setProperty('--i', String(Math.min(visibles, 12))); c.classList.add('entra'); }
      if (ok) visibles++;
    });
    const v = catalogo.querySelector<HTMLElement>('[data-sin-resultados]'); if (v) v.hidden = visibles > 0;
  };
  const filtrar = (k: string, v: string) => {
    estado[k] = v;
    catalogo.querySelectorAll(`[data-filtro^="${k}:"]`).forEach(x => x.setAttribute('aria-pressed', String((x as HTMLElement).dataset.filtro === `${k}:${v}`)));
    const actual = catalogo.querySelector('[data-cat-actual]'); if (k === 'cat' && actual) actual.textContent = v === 'Todo' ? 'Categorías' : v;
    aplicar(true);
  };
  catalogo.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-filtro]'); if (!b) return;
    const [k, v] = b.dataset.filtro!.split(':'); filtrar(k, v);
    const menu = b.closest<HTMLDetailsElement>('[data-cat-menu]');
    if (menu) menu.open = false;
  });
  // links de categorías fuera del catálogo
  document.querySelectorAll<HTMLElement>('[data-ir-cat]').forEach(a => a.addEventListener('click', () => filtrar('cat', a.dataset.irCat!)));
}

// Links internos (#seccion) con desplazamiento suave propio, así anda aunque Windows tenga las animaciones apagadas.
document.addEventListener('click', e => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a || a.hasAttribute('data-producto') || a.getAttribute('href') === '#') return;
  const destino = document.querySelector<HTMLElement>(a.getAttribute('href')!); if (!destino) return;
  e.preventDefault();
  const desde = scrollY, hasta = destino.getBoundingClientRect().top + scrollY, t0 = performance.now(), dur = 700;
  document.documentElement.style.scrollBehavior = 'auto';
  const paso = (t: number) => {
    const k = Math.min((t - t0) / dur, 1), f = 1 - Math.pow(1 - k, 3);
    scrollTo(0, desde + (hasta - desde) * f);
    if (k < 1) requestAnimationFrame(paso); else { document.documentElement.style.scrollBehavior = ''; history.replaceState(null, '', a.getAttribute('href')); }
  };
  requestAnimationFrame(paso);
});
