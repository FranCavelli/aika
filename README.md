# Aika Indu by Cande — tienda

Toda la tienda sale de **`data/aika.xlsx`**. No hace falta tocar código.

| Hoja | Para qué |
|---|---|
| Productos | una fila por prenda: nombre, categoría, Mujer/Hombre/Unisex, precio, precio anterior (tachado), stock, talles, colores, imagen, destacado, nuevo, descripción |
| Categorias | las que aparecen arriba y en los filtros (+ ícono) |
| Config | WhatsApp, Instagram, envío gratis desde, textos e imágenes del inicio y de la sale |
| Ayuda | cómo completar cada columna |

- **Fotos:** un link `https://...` o el nombre de un archivo copiado en `public/productos/` (ej. `vestido1.jpg`). Varias fotos separadas por coma.
- **Stock 0** = AGOTADO (no se puede agregar). Stock 1-3 = "Quedan N".
- El pedido llega por **WhatsApp** con el detalle (prenda, talle, color, total).

## Usar

```
npm install
npm run dev      # http://localhost:4321 — guardás el Excel y refrescás
npm run build    # genera dist/ para subir a Netlify / Vercel / hosting
```

Propuestas: `/rosa`, `/editorial`, `/revista`, `/indice`, `/galeria`, `/lookbook`. Cuando se elija una, se renombra a `index.astro`.
