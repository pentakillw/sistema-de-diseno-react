import tinycolor from 'tinycolor2';

/**
 * Genera un array de 10 tonalidades para un color hexadecimal dado.
 * @param {string} hex - El color base en formato hexadecimal (ej. '#9733c9').
 * @returns {string[]} Un array de 10 strings de colores hexadecimales.
 */
export const generateShades = (hex) => {
  if (!tinycolor(hex).isValid()) return Array(10).fill('#cccccc');
  
  const baseColor = tinycolor(hex);
  const shades = [];

  // Genera una gama de tonalidades claras y oscuras
  shades.push(baseColor.clone().darken(15).toHexString());
  shades.push(baseColor.clone().darken(7).toHexString());
  shades.push(baseColor.clone().toHexString()); // Color base
  shades.push(baseColor.clone().lighten(8).toHexString());
  shades.push(baseColor.clone().lighten(16).toHexString());
  shades.push(baseColor.clone().lighten(24).toHexString());
  shades.push(baseColor.clone().lighten(32).toHexString());
  shades.push(baseColor.clone().lighten(40).toHexString());
  shades.push(baseColor.clone().lighten(48).toHexString());
  shades.push(baseColor.clone().lighten(56).toHexString());

  return shades;
};

/**
 * Genera un array de 10 tonalidades de escala de grises basado en un gris inicial.
 * @param {string} hex - El color gris base.
 * @returns {string[]} Un array de 10 strings de colores hexadecimales.
 */
export const generateGrayShades = (hex) => {
    if (!tinycolor(hex).isValid()) return Array(10).fill('#cccccc');
    
    const baseColor = tinycolor(hex);
    const shades = [];

    // Crea una escala desde un gris muy oscuro a uno muy claro
    const darkGray = baseColor.clone().darken(30);
    for (let i = 0; i < 10; i++) {
       shades.push(darkGray.clone().lighten(i * 9).toHexString());
    }
    return shades;
}
import tinycolor from 'tinycolor2';

/**
 * Genera un array de 10 tonalidades para un color hexadecimal dado.
 * @param {string} hex - El color base en formato hexadecimal (ej. '#9733c9').
 * @returns {string[]} Un array de 10 strings de colores hexadecimales.
 */
export const generateShades = (hex) => {
  if (!tinycolor(hex).isValid()) return Array(10).fill('#cccccc');
  
  const baseColor = tinycolor(hex);
  const shades = [];

  // Genera una gama de tonalidades claras y oscuras
  shades.push(baseColor.clone().darken(15).toHexString());
  shades.push(baseColor.clone().darken(7).toHexString());
  shades.push(baseColor.clone().toHexString()); // Color base
  shades.push(baseColor.clone().lighten(8).toHexString());
  shades.push(baseColor.clone().lighten(16).toHexString());
  shades.push(baseColor.clone().lighten(24).toHexString());
  shades.push(baseColor.clone().lighten(32).toHexString());
  shades.push(baseColor.clone().lighten(40).toHexString());
  shades.push(baseColor.clone().lighten(48).toHexString());
  shades.push(baseColor.clone().lighten(56).toHexString());

  return shades;
};

/**
 * Genera un array de 10 tonalidades de escala de grises basado en un gris inicial.
 * @param {string} hex - El color gris base.
 * @returns {string[]} Un array de 10 strings de colores hexadecimales.
 */
export const generateGrayShades = (hex) => {
    if (!tinycolor(hex).isValid()) return Array(10).fill('#cccccc');
    
    const baseColor = tinycolor(hex);
    const shades = [];

    // Crea una escala desde un gris muy oscuro a uno muy claro
    const darkGray = baseColor.clone().darken(30);
    for (let i = 0; i < 10; i++) {
       shades.push(darkGray.clone().lighten(i * 9).toHexString());
    }
    return shades;
}
