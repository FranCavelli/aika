// Desplazamiento horizontal animado a mano: el smooth del navegador se apaga si Windows tiene las animaciones desactivadas.
const corriendo = new WeakMap<HTMLElement, number>();
export function deslizar(el: HTMLElement, hasta: number, dur = 600) {
  const desde = el.scrollLeft, t0 = performance.now(), id = (corriendo.get(el) ?? 0) + 1;
  corriendo.set(el, id); // un clic nuevo corta la animación anterior en vez de pelearse con ella
  hasta = Math.max(0, Math.min(hasta, el.scrollWidth - el.clientWidth));
  el.classList.add('arrastrando'); // sin snap mientras se mueve
  const paso = (t: number) => {
    if (corriendo.get(el) !== id) return;
    const k = Math.min((t - t0) / dur, 1), f = 1 - Math.pow(1 - k, 3);
    el.scrollLeft = desde + (hasta - desde) * f;
    if (k < 1) requestAnimationFrame(paso); else el.classList.remove('arrastrando');
  };
  requestAnimationFrame(paso);
}
