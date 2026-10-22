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
  // menú hamburguesa del celular
  const menu = document.querySelector<HTMLElement>('[data-menu-movil]');
  const burger = document.querySelector<HTMLElement>('[data-menu]');
  if (menu && burger) {
    const abrirMenu = !!t.closest('[data-menu]') && menu.hidden;
    if (abrirMenu || (!menu.hidden && (!t.closest('[data-menu-movil]') || t.closest('a')))) {
      menu.hidden = !abrirMenu; burger.setAttribute('aria-expanded', String(abrirMenu));
    }
  }
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
// Se anima a mano (no con las animaciones de view transitions) porque Astro las apaga si Windows tiene las animaciones desactivadas.
const LUGAR = 'aika-lugar';
type Vuelo = { rect: DOMRect; src: string; id: string; aProducto: boolean };
let vuelo: Vuelo | null = null;
const fotoVisible = (sel: string) => [...document.querySelectorAll<HTMLImageElement>(sel)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; });
document.addEventListener('astro:before-preparation', (e: any) => {
  vuelo = null;
  const aProducto = /\/producto\//.test(e.to.pathname);
  const card = (e.sourceElement as HTMLElement | undefined)?.closest<HTMLElement>('[data-producto]');
  const img = aProducto ? card?.querySelector('img') : fotoVisible('[data-pp-foto]');
  // al salir del catálogo hacia una prenda se guarda dónde estaba (scroll y categoría) para volver al mismo lugar
  if (aProducto && document.querySelector('[data-catalogo]')) {
    const cat = document.querySelector<HTMLElement>('[data-filtro^="cat:"][aria-pressed="true"]')?.dataset.filtro ?? '';
    try { sessionStorage.setItem(LUGAR, JSON.stringify({ y: scrollY, cat })); } catch {}
  }
  if (!img) return;
  const id = aProducto ? card!.dataset.producto! : document.querySelector<HTMLElement>('[data-pp]')!.dataset.pp!;
  vuelo = { rect: img.getBoundingClientRect(), src: img.currentSrc || img.src, id, aProducto };
});
// fotos destino ocultas desde el primer cuadro de la página nueva, si no se ven dos veces (la quieta y la que vuela)
const destinos = () => vuelo ? [...document.querySelectorAll<HTMLElement>(vuelo.aProducto ? '[data-pp-foto]' : `[data-producto="${vuelo.id}"] img`)] : [];
document.addEventListener('astro:after-swap', () => {
  destinos().forEach(x => x.style.visibility = 'hidden');
  if (vuelo?.aProducto) aterrizar(); // hacia la ficha no hay scroll que restaurar: despega ya
  document.querySelector('main')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' });
});
function volverAlLugar() {
  if (!document.querySelector('[data-catalogo]')) return;
  let l: { y: number; cat: string } | null = null;
  try { l = JSON.parse(sessionStorage.getItem(LUGAR) || 'null'); sessionStorage.removeItem(LUGAR); } catch {}
  if (!l || !vuelo) return;
  if (l.cat) document.querySelector<HTMLElement>(`[data-filtro="${l.cat}"]`)?.click();
  document.querySelectorAll<HTMLElement>('.prod.entra').forEach(x => x.classList.remove('entra'));
  document.documentElement.style.scrollBehavior = 'auto';
  scrollTo(0, l.y);
  document.documentElement.style.scrollBehavior = '';
}
function ponerFotoEnTarjeta(img: HTMLImageElement, v: Vuelo) {
  const p = porId.get(v.id); if (!p) return;
  const n = p.imagenes.findIndex(x => v.src.endsWith(x.replace(/^.*\//, '')));
  if (n < 0) return;
  img.src = p.imagenes[n];
  const puntos = img.parentElement!.querySelector('.prod-puntos');
  if (!puntos) return;
  puntos.classList.add('mov');
  [...puntos.children].forEach((x, i) => x.classList.toggle('on', i === Math.min(n, puntos.children.length - 1)));
}
function aterrizar() {
  const ocultas = destinos();
  const v = vuelo; vuelo = null;
  if (!v) return;
  const mostrar = () => ocultas.forEach(x => x.style.visibility = '');
  if (v.aProducto && scrollY > 0) scrollTo(0, 0);
  const destino = v.aProducto ? document.querySelector<HTMLImageElement>('[data-pp-foto]') : fotoVisible(`[data-producto="${v.id}"] img`);
  if (!destino) { mostrar(); return; }
  // la foto que se estaba viendo sigue siendo la misma del otro lado (tarjeta o página de producto)
  if (v.aProducto) document.querySelector('[data-pp]')!.dispatchEvent(new CustomEvent('aika:ir-foto', { detail: v.src }));
  else ponerFotoEnTarjeta(destino, v);
  const a = v.rect, b = destino.getBoundingClientRect();
  const clon = document.createElement('img');
  clon.src = v.src; clon.className = 'vuelo';
  Object.assign(clon.style, { left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px`, borderRadius: getComputedStyle(destino.parentElement!).borderRadius });
  document.body.append(clon);
  destino.style.visibility = 'hidden';
  const desde = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  clon.animate([{ transform: desde }, { transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished
    .finally(() => { mostrar(); destino.style.visibility = ''; clon.remove(); });
}

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
document.addEventListener('astro:page-load', () => { pintarBolsa(); armarCatalogo(); volverAlLugar(); requestAnimationFrame(aterrizar); });
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
  // con setTimeout y no requestAnimationFrame: Chrome congela rAF si la ventana queda tapada
  const paso = () => {
    const k = Math.min((performance.now() - t0) / dur, 1), f = 1 - Math.pow(1 - k, 3);
    scrollTo(0, desde + (hasta - desde) * f);
    if (k < 1) setTimeout(paso, 16); else { document.documentElement.style.scrollBehavior = ''; history.replaceState(null, '', a.getAttribute('href')); }
  };
  paso();
}, true); // en captura, antes que el router de Astro (que salta sin animar)
