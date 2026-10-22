// Desplazamiento horizontal animado a mano: el smooth del navegador se apaga si Windows tiene las animaciones desactivadas.
export function deslizar(el: HTMLElement, hasta: number, dur = 650) {
  const desde = el.scrollLeft, t0 = performance.now();
  hasta = Math.max(0, Math.min(hasta, el.scrollWidth - el.clientWidth));
  el.classList.add('arrastrando'); // sin snap mientras se mueve
  const paso = () => {
    const k = Math.min((performance.now() - t0) / dur, 1), f = 1 - Math.pow(1 - k, 3);
    el.scrollLeft = desde + (hasta - desde) * f;
    if (k < 1) setTimeout(paso, 16); else el.classList.remove('arrastrando');
  };
  paso();
}
