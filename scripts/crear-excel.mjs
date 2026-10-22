// Genera data/aika.xlsx de ejemplo. Correr una sola vez: después se edita el Excel a mano.
import * as XLSX from 'xlsx';
import fs from 'node:fs';
XLSX.set_fs(fs);

const u = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

const f = (...n) => n.map(x => `aika-${String(x).padStart(2, '0')}.jpg`).join(',');

const productos = [
  ['id','nombre','categoria','genero','precio','precio_anterior','stock','talles','colores','imagen','destacado','nuevo','descripcion'],
  ['EN01','Enterito Suplex','Enteritos','Mujer',32900,'',40,'S,M,L','rosa,bordo,rosa claro,gris azulado,azul marino,verde,negro,azul,celeste',f(10,11,12,13,14,15,16,17,18,19),'si','si','Suplex elastizado, tiras regulables, tazas desmontables y costuras que definen.'],
  ['TO01','Musculosa Melville Puntilla','Tops','Mujer',15900,'',18,'S,M,L','blanco,negro',f(5,8),'si','no','Tela melville de verano con detalle de puntilla en el borde.'],
  ['TO02','Musculosa Morley Básica','Tops','Mujer',11900,'',30,'Único','negro,topo,chocolate,blanco,gris',f(1),'no','no','Morley acanalado, calce al cuerpo. Un básico en cinco colores.'],
  ['TO03','Musculosa de Tiras','Tops','Mujer',12900,14900,12,'Único','chocolate,blanco,negro',f(2),'no','no','Tiritas finas y escote redondo, ideal para combinar.'],
  ['TO04','Musculosa Rayada','Tops','Mujer',14900,'',3,'Único','celeste,rosa',f(3),'no','si','Tejido rayado con vivos de color en escote y sisas.'],
  ['PA01','Oxford Línea','Pantalones','Mujer',27900,'',15,'S,M,L','negro',f(9),'si','no','Lycra importada, cintura en V y doble línea al costado.'],
  ['PA02','Jogger Wide Leg Batik','Pantalones','Mujer',29900,'',8,'S,M,L','gris',f(4),'no','si','Tela rústica batik, bolsillos laterales y tanca ajustable.'],
  ['SH01','Short Sastrero con Cinto','Shorts','Mujer',24900,29900,10,'S,M,L','chocolate,negro,camel',f(7),'si','no','Tiro alto con cinto forrado. Va con todo.'],
  ['VE01','Vestido Calado','Vestidos','Mujer',34900,'',0,'Único','crudo,chocolate,blanco,negro',f(6),'no','no','Tejido calado, manga larga y escote en V. También como salida de playa.'],
];

const categorias = [
  ['nombre','icono','orden'],
  ['Enteritos','vestido',1],['Tops','remera',2],['Pantalones','pantalon',3],['Shorts','pantalon',4],['Vestidos','vestido',5],
];

const config = [
  ['clave','valor'],
  ['whatsapp','5491100000000'],
  ['instagram','aika.indu'],
  ['moneda','$'],
  ['envio_gratis_desde',60000],
  ['hero_etiqueta','Nueva colección'],
  ['hero_titulo','Estilo que se siente'],
  ['hero_script','como vos'],
  ['hero_texto','Descubrí lo nuevo de la temporada. Desde el día a día hasta los momentos especiales.'],
  ['hero_imagen',u('1515886657613-9f3515b0c78f')],
  ['promo_titulo','Hasta 30% off'],
  ['promo_texto','Renová tu placard con la sale de temporada.'],
  ['promo_imagen','/productos/aika-07.jpg'],
];

const wb = XLSX.utils.book_new();
const hoja = (rows, widths) => { const ws = XLSX.utils.aoa_to_sheet(rows); ws['!cols'] = widths.map(w => ({ wch: w })); return ws; };
XLSX.utils.book_append_sheet(wb, hoja(productos,[7,24,12,9,10,15,7,14,26,40,10,7,50]), 'Productos');
XLSX.utils.book_append_sheet(wb, hoja(categorias,[14,12,7]), 'Categorias');
XLSX.utils.book_append_sheet(wb, hoja(config,[22,60]), 'Config');
XLSX.utils.book_append_sheet(wb, hoja([
  ['AYUDA'],
  ['Productos: una fila por prenda. "stock" en 0 la muestra como AGOTADO.'],
  ['precio_anterior: si lo completás, aparece tachado con el % de descuento.'],
  ['talles y colores: separados por coma. Colores por nombre (negro, crudo, rosa, camel, jean...) o código #hex.'],
  ['imagen: un link (https://...) o el nombre de un archivo puesto en public/productos (ej: vestido1.jpg). Varias imágenes separadas por coma.'],
  ['destacado = si -> aparece en "Los más elegidos". nuevo = si -> etiqueta NUEVO.'],
  ['Categorias: iconos disponibles: vestido, remera, pantalon, blazer, cartera, zapato, camisa.'],
  ['Config: textos del inicio, WhatsApp (con código de país, sin +) y envío gratis.'],
  ['Después de guardar: refrescar la página (npm run dev) o volver a publicar (npm run build).'],
],[110]), 'Ayuda');
fs.mkdirSync('data', { recursive: true });
XLSX.writeFile(wb, 'data/aika.xlsx');
console.log('data/aika.xlsx creado');
