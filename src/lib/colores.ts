// Nombre de color (lo que se escribe en el Excel) -> muestra. También acepta códigos #hex.
const COLORES: Record<string, string> = {
  negro: '#1d1d1d', blanco: '#ffffff', crudo: '#f3eee7', beige: '#d8c3a5', arena: '#d8c3a5', camel: '#c8a27c',
  marron: '#6b4a35', chocolate: '#4a3226', rosa: '#d9789f', fucsia: '#c2185b', rojo: '#b33a3a', bordo: '#6d1f2c',
  coral: '#e5735f', naranja: '#e08a3c', amarillo: '#e9c46a', verde: '#6b7f5e', oliva: '#77744a', celeste: '#9db7d5',
  azul: '#2456d6', 'azul marino': '#1f2a4d', 'rosa claro': '#f2b8d2', 'gris azulado': '#7d8aa3', jean: '#5b7aa6', lila: '#b8a1c9', gris: '#8a8a8a', topo: '#8b7d72', dorado: '#c9a227', plateado: '#c0c0c0',
};
export const muestra = (c: string) => c.startsWith('#') ? c : COLORES[c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || '#cccccc';
