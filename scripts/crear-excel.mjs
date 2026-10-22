// Genera data/aika.xlsx de ejemplo. Correr una sola vez: después se edita el Excel a mano.
import * as XLSX from 'xlsx';
import fs from 'node:fs';
XLSX.set_fs(fs);

const u = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

const f = (...n) => n.map(x => `aika-${String(x).padStart(2, '0')}.jpg`).join(',');

const productos = [
  ['id','nombre','categoria','genero','precio','precio_anterior','stock','talles','colores','imagen','destacado','nuevo','descripcion'],
  ['CS01','Catsuit Curve','Bodys y catsuits','Mujer',24000,'',10,'S/M (38/40),L/XL (42/44)','rosa,bordo,rosa claro,gris azulado,azul marino,verde,negro,azul,celeste',f(10,11,12,13,14,15,16,17,18,19),'si','si','Suplex elastizado, tiras regulables y tazas desmontables.'],
  ['CS02','Catsuit Algodón Lycra','Bodys y catsuits','Mujer',18000,'',10,'Único','negro,gris,blanco,chocolate,rosa,azul,rojo','','no','no','Algodón lycra premium. Talle único, cede a un M.'],
  ['CS03','Catsuit Forrado Soft','Bodys y catsuits','Mujer',18500,'',10,'S (38/40),L (40/42)','negro','','no','no','Modal soft, todo forrado (doble tela).'],
  ['BO01','Body Cadenas','Bodys y catsuits','Mujer',16500,'',10,'Único','negro','','no','no','Body con detalle de cadenas.'],
  ['BO02','Body Encaje Lencero','Bodys y catsuits','Mujer',16500,'',10,'Único','negro','','no','si','Encaje lencero, busto forrado. Talle único, aprox. S/M.'],
  ['BO03','Body Puntilla Espalda','Bodys y catsuits','Mujer',16000,'',10,'Único','negro','','no','no','Microfibra, busto forrado, con broche. Talle único, cede a un M.'],
  ['BO04','Body Cruzado Espalda','Bodys y catsuits','Mujer',15500,'',10,'Único','negro','','no','no','Microfibra, busto forrado, con broche. Talle único, aprox. S.'],
  ['TP01','Top Lucy Morley','Tops','Mujer',12000,'',10,'Único','negro,topo,gris,blanco,chocolate',f(1),'si','no','Morley de algodón premium. Talle único, cede a M.'],
  ['TP02','Top Gigi Forrado','Tops','Mujer',12000,'',10,'Único','negro,blanco,chocolate','','no','si','Microfibra premium, todo forrado (doble tela). Talle único, cede a M.'],
  ['TP03','Top Algodón Lycra','Tops','Mujer',11000,'',10,'Único','negro,blanco,celeste,chocolate,gris','','no','no','Algodón lycra premium. Talle único, cede a un M.'],
  ['TP04','Corset Encaje Microfibra','Tops','Mujer',16500,'',10,'Único','negro,blanco,chocolate','','no','no','Microfibra con detalle de encaje, delantera forrada. Base crop. Talle único, cede a un M.'],
  ['TP05','Top Hillary Corset','Tops','Mujer',16500,'',10,'Único','negro,blanco','','no','no','Encaje cassia elastizado, busto forrado. Talle único, cede a M.'],
  ['TP06','Top Micro Lola','Tops','Mujer',14500,'',10,'Único','blanco,negro,chocolate','','no','no','Microfibra con corpiño de encaje, busto forrado. Base crop. Talle único.'],
  ['TP07','Corpiño Forrado Encaje','Tops','Mujer',13000,'',10,'Único','negro,chocolate,blanco','','no','no','Encaje forrado de modal soft. Talle único.'],
  ['TP08','Camisa Noa Encaje','Tops','Mujer',19000,'',10,'Único','negro','','si','si','Encaje elastizado, botones funcionales. Base crop. Talle único, abarca M.'],
  ['MU01','Musculosa Encanto','Musculosas','Mujer',15000,'',10,'2,3,4,5','blanco,negro,gris,rosa claro,celeste,marron',f(5),'si','no','Tela melville de verano.'],
  ['MU02','Musculosa Renda','Musculosas','Mujer',15000,'',10,'2,3,4,5,6','rosa,gris,negro,blanco,marron',f(8),'no','no','Tela melville, larguitas, con puntilla en cuello y sisas.'],
  ['MU03','Musculosa Ameli Morley','Musculosas','Mujer',14300,'',10,'Único','chocolate,blanco,negro',f(2),'no','no','Morley de algodón premium. Son cortas. Talle único, cede a M.'],
  ['MU04','Musculosa Rayada Hilo','Musculosas','Mujer',20000,'',10,'Único','celeste,rosa',f(3),'no','si','Hilo lycra premium. Base crop. Talle único.'],
  ['MU05','Musculosa Marni Puntilla','Musculosas','Mujer',15500,'',10,'Único','chocolate,negro','','no','no','Marni con detalle de puntilla. Base crop. Talle único, cede a un M.'],
  ['MU06','Musculosa Kenia Botón','Musculosas','Mujer',28500,'',10,'Único','negro','','no','no','Importada. Hilo lycra premium, botones funcionales. Base clásica. Talle único, aprox. M.'],
  ['MU07','Musculosa Buche Morley','Musculosas','Mujer',14400,'',10,'Único','negro,blanco,chocolate','','no','no','Morley tao con detalle de mostacillas. Talle único, aprox. M.'],
  ['MU08','Musculosa Bretel Forrada','Musculosas','Mujer',12000,'',10,'Único','frambuesa,blanco,chocolate,negro','','no','no','Modal soft, todo forrado (doble tela). Talle único, cede a un M.'],
  ['RE01','Remera Espejo','Remeras','Mujer',12500,'',10,'Único','negro','','no','no','Tela melvin. Talle único hasta un L.'],
  ['RE02','Remera Pez','Remeras','Mujer',12000,'',10,'Único','negro','','no','no','Tela melvin. Talle único hasta un L.'],
  ['RE03','Remera NY Taxi','Remeras','Mujer',14500,'',10,'Único','chocolate,blanco,negro,bordo','','si','si','Algodón jersey, estampado DTF. Talle único, aprox. M/L.'],
  ['RE04','Remera Samara Cropped','Remeras','Mujer',13500,'',10,'S,L','negro,blanco,topo,chocolate,marron','','no','no','Algodón, modelo over boxy. S: sisa 50 cm, largo 50 cm. L: 57 x 57 cm.'],
  ['RE05','Camiseta Roma Encaje','Remeras','Mujer',16500,'',10,'Único','chocolate,blanco,negro','','no','si','Encaje, manga con abertura. Pupera. Talle único, cede a M.'],
  ['RE06','Puperón Oversize','Remeras','Mujer',13000,'',10,'Único','negro,blanco,chocolate','','no','no','Algodón, modelo oversize. Talle único, aprox. L/XL de sisa.'],
  ['RE07','Reme Top Algodón Lycra','Remeras','Mujer',14500,'',10,'Único','negro,gris,blanco,chocolate','','no','no','Algodón lycra premium. Talle único, cede a M.'],
  ['RE08','Reme Brooklyn Crop','Remeras','Mujer',15500,'',10,'Único','azul,negro,chocolate,rojo','','no','si','Algodón lycra estampado. Base crop. Talle único, cede a un M.'],
  ['RE09','Remera Boxy Rayada','Remeras','Mujer',17500,'',10,'Único','blanco','','no','si','Algodón jersey premium, bordado. Modelo over, talle único (abarca aprox. L).'],
  ['RE10','Reme Tokio Puntilla','Remeras','Mujer',15000,'',10,'Único','negro','','no','no','Microfibra, base crop (cortas). Talle único, cede a un M.'],
  ['RE11','Remera Micro Corset','Remeras','Mujer',17500,'',10,'Único','chocolate,blanco,negro','','no','no','Microfibra, base crop. Talle único, cede a un M.'],
  ['RE12','Remera Virginia','Remeras','Mujer',16000,'',10,'2,3,4,5','crudo,negro,beige,azul,verde','','no','no','Melville (algodón con lycra de verano). Talle 2 en todos los colores; 3: natural, negro, beige, azul, verde; 4: natural, negro, beige; 5: natural, negro, verde. Sin cambio.'],
  ['VE01','Vestido Playero','Vestidos','Mujer',19500,'',10,'Único (hasta XL)','crudo,chocolate,blanco,negro',f(6),'si','no','Hilo. Colores disponibles los de las fotos.'],
  ['VE02','Vestido Margot Hilo','Vestidos','Mujer',32000,'',10,'Único','negro','','no','no','Importado, hilo lycra premium. Talle único.'],
  ['VE03','Vestido Olimpia Encaje','Vestidos','Mujer',23500,'',10,'Único','negro,blanco,chocolate','','no','no','Encaje elastizado, con short interno. Talle único, cede a un M.'],
  ['VE04','Vestido Soft Corto','Vestidos','Mujer',16000,'',10,'Único','negro,bordo','','no','no','Modal soft, busto forrado. Talle único.'],
  ['VE05','Vestido Algodón Lycra','Vestidos','Mujer',16000,'',10,'Único','chocolate,gris,negro','','no','no','Algodón lycra premium. Talle único.'],
  ['VE06','Vestido Hilo Rayado','Vestidos','Mujer',26500,'',10,'Único','celeste,amarillo,chocolate','','si','si','Hilo lycra premium. Talle único.'],
  ['VE07','Vestido Largo Básico','Vestidos','Mujer',19000,'',10,'Único','negro','','no','no','Morley capri con tajo, busto forrado. Talle único, cede a un M.'],
  ['VE08','Vestido Largo Marilyn','Vestidos','Mujer',23500,'',10,'Único','negro','','no','no','Algodón lycra premium, busto forrado, con tajo. Talle único, cede a M.'],
  ['VE09','Vestido Largo Puntilla','Vestidos','Mujer',19500,'',10,'Único','negro','','no','no','Morley capri con tajo. Talle único, cede a un M.'],
  ['VE10','Skort Lazo Encaje','Vestidos','Mujer',22500,'',10,'Único','negro','','no','si','Encaje elastizado con short interno. Talle único, cede a 38.'],
  ['PA01','Wide Leg Elastizado','Pantalones','Mujer',25500,'',10,'38,40,42,44,46,48','jean','','no','no','Jean elastizado, pierna amplia.'],
  ['PA02','Oxford','Pantalones','Mujer',25500,'',10,'38,40,42,44,46,48','negro',f(9),'si','no','Lycra importada, cintura en V y línea al costado.'],
  ['PA03','Wide Leg con Rotura','Pantalones','Mujer',26500,'',10,'36,38','jean','','no','no','Jean rígido con roturas.'],
  ['PA04','Pollera Polly','Pantalones','Mujer',27000,'',10,'36,38,40,42,44,46','jean','','no','no','Jean rígido.'],
  ['PA05','Baggy Camuflado','Pantalones','Mujer',32000,'',10,'36,38,40,42,44,46','verde','','no','no','Rígido, estampa camuflada.'],
  ['PA06','Palazo Sastrero con Cinto','Pantalones','Mujer',23500,'',10,'2,3,4,5','negro','','no','no','Creep sastrero con cinto.'],
  ['PA07','Oxford London','Pantalones','Mujer',21000,'',10,'M (36/38),G (40),GG (42/44)','negro','','no','no','Oxford clásico.'],
  ['PA08','Baggy Batik','Pantalones','Mujer',21500,'',10,'2 (38),3 (40),4 (42),5 (44/46)','gris',f(4),'si','no','Tela rústica batik, bolsillos laterales y tanca ajustable.'],
  ['PA09','Pantalón Linora','Pantalones','Mujer',22000,'',10,'2 (38),3 (40),4 (42),5 (44)','beige,celeste,verde,negro','','no','no','Sin cambio.'],
  ['SH01','Short Tira Cruzado','Shorts','Mujer',23000,'',10,'36,38,40,42,44,46','jean','','no','no','Jean con tiras cruzadas.'],
  ['SH02','Short Botón','Shorts','Mujer',23000,'',10,'36,38,40,42,44,46','jean','','no','no','Jean con botones.'],
  ['SH03','Bermuda Clasic','Shorts','Mujer',24000,'',10,'36,38,40,42,44,46','jean','','no','no','Bolsillos traseros.'],
  ['SH04','Short Pollera Napoleón','Shorts','Mujer',25000,'',10,'36,38,40,42,44,46','celeste,azul','','no','no','Jean rígido con bolsillo.'],
  ['SH05','Short Creep con Cinto','Shorts','Mujer',20000,'',10,'2,3,4,5','chocolate,negro,camel',f(7),'si','no','Creep sastrero con cinto.'],
  ['SH06','Short Fit','Shorts','Mujer',18000,'',10,'S/M (38/40),L/XL (42/44)','chocolate,bordo,azul,topo,camel,celeste,negro','','no','no','S/M: choco, bordo, azul eléctrico, topo, camel. L/XL: celeste, negro, azul eléctrico, gris topo. Sin cambio.'],
  ['AB01','Campera Rústica Corta','Abrigos','Mujer',26000,'',10,'Único','negro','','no','no','Campera de tela rústica, corta.'],
  ['AB02','Cardigan Calado Hilo','Abrigos','Mujer',29000,'',10,'Único (hasta L)','negro,marron,chocolate','','no','no','Hilo de algodón premium (hilado de verano). Modelo oversize.'],
  ['AB03','Campera Oversize Tencel','Abrigos','Mujer',35500,'',10,'Único (aprox. L/XL)','negro,crudo,chocolate','','no','no','Tencel símil lino, modelo oversize (amplio).'],
];

const categorias = [
  ['nombre','icono','orden'],
  ['Bodys y catsuits','vestido',1],['Tops','remera',2],['Musculosas','remera',3],['Remeras','remera',4],['Vestidos','vestido',5],['Pantalones','pantalon',6],['Shorts','pantalon',7],['Abrigos','blazer',8],
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
