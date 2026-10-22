// Carrito (localStorage), ficha de producto, filtros y pedido por WhatsApp.
import { muestra } from '../lib/colores';
type P = { id: string; nombre: string; categoria: string; precio: number; precioAnterior: number | null; descuento: number; stock: number; talles: string[]; colores: string[]; imagenes: string[]; descripcion: string };
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

// --- Ficha ---
const ficha = $('#ficha');
let actual: P | null = null, talle = '', color = '';
const swatch = muestra;

// Galería de la ficha: flechas, puntos y deslizar (scroll-snap sin barra)
const fotos = $('.ficha-fotos', ficha);
const fotoActual = () => Math.round(fotos.scrollLeft / Math.max(fotos.clientWidth, 1));
function irAFoto(n: number) {
  const total = fotos.children.length; if (!total) return;
  n = (n + total) % total;
  fotos.scrollTo({ left: n * fotos.clientWidth, behavior: 'smooth' });
}
function marcarFoto() {
  const n = fotoActual();
  ficha.querySelectorAll('.gal-puntos button').forEach((b, i) => b.setAttribute('aria-selected', String(i === n)));
}
function armarGaleria(total: number) {
  const g = $('.galeria', ficha);
  g.classList.toggle('una', total < 2);
  $('.gal-puntos', ficha).innerHTML = total < 2 ? '' : Array.from({ length: total }, (_, i) => `<button type="button" role="tab" aria-label="Foto ${i + 1}" aria-selected="${i === 0}" data-foto="${i}"></button>`).join('');
  fotos.scrollLeft = 0;
}
fotos.addEventListener('scroll', () => requestAnimationFrame(marcarFoto), { passive: true });
ficha.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') irAFoto(fotoActual() + 1);
  if (e.key === 'ArrowLeft') irAFoto(fotoActual() - 1);
});

function abrirFicha(id: string) {
  const p = porId.get(id); if (!p) return;
  actual = p; talle = p.talles.length === 1 ? p.talles[0] : ''; color = p.colores[0] || '';
  $('.ficha-fotos', ficha).innerHTML = p.imagenes.map((src, i) => `<img src="${src}" alt="${p.nombre}${i ? ` (foto ${i + 1})` : ''}">`).join('');
  armarGaleria(p.imagenes.length);
  $('.ficha-cat', ficha).textContent = p.categoria;
  $('.ficha-nombre', ficha).textContent = p.nombre;
  $('.ficha-precio', ficha).innerHTML = `${plata(p.precio)}${p.precioAnterior ? ` <s>${plata(p.precioAnterior)}</s> <em>-${p.descuento}%</em>` : ''}`;
  $('.ficha-desc', ficha).textContent = p.descripcion;
  $('.ficha-colores', ficha).hidden = !p.colores.length;
  $('.ficha-colores div', ficha).innerHTML = p.colores.map(c => `<button type="button" class="color" style="--c:${swatch(c)}" aria-label="Color ${c}" aria-pressed="${c === color}" data-color="${c}"></button>`).join('');
  $('.ficha-talles', ficha).hidden = !p.talles.length;
  $('.ficha-talles div', ficha).innerHTML = p.talles.map(t => `<button type="button" class="talle" aria-pressed="${t === talle}" data-talle="${t}">${t}</button>`).join('');
  const st = $('.ficha-stock', ficha);
  st.textContent = p.stock <= 0 ? 'Agotado por ahora' : p.stock <= 3 ? `Quedan ${p.stock}` : 'En stock';
  st.dataset.nivel = p.stock <= 0 ? '0' : p.stock <= 3 ? 'bajo' : 'ok';
  const btn = $('.ficha-agregar', ficha) as HTMLButtonElement;
  btn.disabled = p.stock <= 0; btn.textContent = p.stock <= 0 ? 'Sin stock' : 'Agregar a la bolsa';
  $('.ficha-aviso', ficha).textContent = '';
  abrir(ficha);
}
ficha.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest('button'); if (!b) return;
  if (b.dataset.gal) { irAFoto(fotoActual() + Number(b.dataset.gal)); return; }
  if (b.dataset.foto) { irAFoto(Number(b.dataset.foto)); return; }
  if (b.dataset.talle) { talle = b.dataset.talle; ficha.querySelectorAll('.talle').forEach(x => x.setAttribute('aria-pressed', String(x === b))); $('.ficha-aviso', ficha).textContent = ''; }
  if (b.dataset.color) {
    color = b.dataset.color; ficha.querySelectorAll('.color').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    // si hay una foto por color (mismo orden que en el Excel), mostrar la de ese color
    const n = actual!.colores.indexOf(color);
    if (actual!.imagenes.length >= actual!.colores.length && fotos.children[n]) irAFoto(n);
  }
});
$('.ficha-agregar', ficha).addEventListener('click', () => {
  if (!actual) return;
  const aviso = $('.ficha-aviso', ficha);
  if (actual.talles.length && !talle) { aviso.textContent = 'Elegí un talle para seguir.'; return; }
  const enBolsa = bolsa.filter(i => i.id === actual!.id).reduce((s, i) => s + i.cant, 0);
  if (enBolsa >= actual.stock) { aviso.textContent = `Ya tenés todo el stock disponible (${actual.stock}).`; return; }
  const ya = bolsa.find(i => i.id === actual!.id && i.talle === talle && i.color === color);
  ya ? ya.cant++ : bolsa.push({ id: actual.id, talle, color, cant: 1 });
  guardar(); abrir($('#bolsa'));
});

document.addEventListener('click', e => {
  const t = e.target as HTMLElement;
  if (t.closest('[data-cerrar]')) { cerrar(); return; }
  const card = t.closest<HTMLElement>('[data-producto]');
  if (card) { e.preventDefault(); abrirFicha(card.dataset.producto!); }
  if (t.closest('[data-abrir-bolsa]')) { e.preventDefault(); abrir($('#bolsa')); }
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

// --- Filtros del catálogo ---
const catalogo = document.querySelector<HTMLElement>('[data-catalogo]');
if (catalogo) {
  const estado: Record<string, string> = { cat: 'Todo', gen: 'Todo' };
  const aplicar = () => {
    let visibles = 0;
    catalogo.querySelectorAll<HTMLElement>('[data-cat]').forEach(c => {
      const ok = (estado.cat === 'Todo' || c.dataset.cat === estado.cat) && (estado.gen === 'Todo' || c.dataset.gen === estado.gen || c.dataset.gen === 'Unisex');
      c.hidden = !ok; if (ok) visibles++;
    });
    const v = catalogo.querySelector<HTMLElement>('[data-sin-resultados]'); if (v) v.hidden = visibles > 0;
  };
  const filtrar = (k: string, v: string) => {
    estado[k] = v;
    catalogo.querySelectorAll(`[data-filtro^="${k}:"]`).forEach(x => x.setAttribute('aria-pressed', String((x as HTMLElement).dataset.filtro === `${k}:${v}`)));
    aplicar();
  };
  catalogo.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-filtro]'); if (!b) return;
    const [k, v] = b.dataset.filtro!.split(':'); filtrar(k, v);
  });
  // links de categorías fuera del catálogo
  document.querySelectorAll<HTMLElement>('[data-ir-cat]').forEach(a => a.addEventListener('click', () => filtrar('cat', a.dataset.irCat!)));
}
