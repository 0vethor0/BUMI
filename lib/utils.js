/**
 * Importaciones de utilidades para el manejo de clases CSS.
 * clsx: Permite concatenar clases condicionalmente.
 * tailwind-merge: Resuelve conflictos entre clases de Tailwind CSS (ej. "p-2 p-4" se convierte en "p-4").
 */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Función 'cn' (Class Name).
 * Combina clsx y twMerge para facilitar la aplicación de clases dinámicas en componentes.
 * 
 * @param {...string|object|array} inputs - Lista de clases, objetos o arreglos de clases CSS.
 * @returns {string} Una cadena de texto con las clases resultantes optimizadas.
 */
export function cn(...inputs) {
  // Primero aplica clsx para resolver condicionales y luego twMerge para limpiar duplicados de Tailwind.
  return twMerge(clsx(inputs));
}
