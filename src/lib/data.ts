// Lee data/aika.xlsx: toda la tienda (productos, categorías, textos) sale del Excel.
import * as XLSX from 'xlsx';
import fs from 'node:fs';
import path from 'node:path';

export type Producto = {
  id: string; nombre: string; categoria: string; genero: string;
  precio: number; precioAnterior: number | null; descuento: number;
  stock: number; talles: string[]; colores: string[]; imagenes: string[];
  destacado: boolean; nuevo: boolean; descripcion: string;
};
export type Categoria = { nombre: string; icono: string; orden: number };

const lista = (v: unknown) => String(v ?? '').split(',').map(s => s.trim()).filter(Boolean);
const si = (v: unknown) => ['si', 'sí', 'x', '1', 'true'].includes(String(v ?? '').trim().toLowerCase());
const num = (v: unknown) => { const n = Number(String(v ?? '').replace(/[^\d.,-]/g, '').replace(',', '.')); return isFinite(n) ? n : 0; };
// Rutas relativas a la base del sitio (en GitHub Pages vive en /aika/).
export const ruta = (s: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${s.replace(/^\//, '')}`;
const imagen = (s: string) => /^https?:\/\//.test(s) ? s : s.startsWith('/') ? ruta(s) : ruta(`productos/${s}`);

export function cargarTienda() {
  const wb = XLSX.read(fs.readFileSync(path.resolve('data/aika.xlsx')));
  const filas = (hoja: string) => wb.Sheets[hoja] ? XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[hoja], { defval: '' }) : [];

  const productos: Producto[] = filas('Productos')
    .filter(f => String(f.nombre).trim())
    .map((f, i) => {
      const precio = num(f.precio);
      const anterior = num(f.precio_anterior) > precio ? num(f.precio_anterior) : null;
      return {
        id: String(f.id || `p${i + 1}`).trim(),
        nombre: String(f.nombre).trim(),
        categoria: String(f.categoria).trim(),
        genero: String(f.genero || 'Mujer').trim(),
        precio, precioAnterior: anterior,
        descuento: anterior ? Math.round((1 - precio / anterior) * 100) : 0,
        stock: num(f.stock),
        talles: lista(f.talles), colores: lista(f.colores),
        imagenes: lista(f.imagen).map(imagen),
        destacado: si(f.destacado), nuevo: si(f.nuevo),
        descripcion: String(f.descripcion).trim(),
      };
    });

  const categorias: Categoria[] = filas('Categorias')
    .filter(f => String(f.nombre).trim())
    .map(f => ({ nombre: String(f.nombre).trim(), icono: String(f.icono || 'remera').trim(), orden: num(f.orden) }))
    .sort((a, b) => a.orden - b.orden);

  const config: Record<string, string> = {};
  for (const f of filas('Config')) config[String(f.clave).trim()] = String(f.valor ?? '').trim();
  for (const k of Object.keys(config)) if (k.endsWith('_imagen') && config[k]) config[k] = imagen(config[k]);

  return { productos, categorias, config };
}

export const precio = (n: number, moneda = '$') => `${moneda}${n.toLocaleString('es-AR')}`;
