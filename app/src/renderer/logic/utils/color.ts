/**
 *  shouldTextBeLightOrDark
 *
 *  Given the background luminosity, what should the text be?
 *
 * @param bgTheme
 * @returns
 */
export function detectTextTheme(bgTheme: 'light' | 'dark') {
  // Using the HSP value, determine whether the color is light or dark
  if (bgTheme === 'dark') {
    // the background image is too light
    return 'light';
  } else {
    return 'dark';
  }
}

/**
 *  bgIsLightOrDark
 *
 *  Given a hex color will determine light or dark
 *
 * @param {string} color - a hex value
 * @returns
 */
export function bgIsLightOrDark(hexColor: string) {
  const color = +(
    '0x' + hexColor.slice(1).replace(hexColor.length < 5 ? /./g : '', '$&$&')
  );

  const r = color >> 16;
  const g = (color >> 8) & 255;
  const b = color & 255;

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  // console.log(hsp);
  if (hsp > 127.5) {
    // the background image is too light
    return 'light';
  } else {
    return 'dark';
  }
}

export function cleanNounColor(ux: string) {
  if (ux.length > 2 && ux.substring(0, 2) === '0x') {
    const value = ux.substring(2).replace('.', '').padStart(6, '0');
    return `#${value}`;
  }

  const value = ux.replace('.', '').padStart(6, '0');
  return `#${value}`;
}

export function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToString(rgb: { r: number; g: number; b: number } | null) {
  return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : rgb;
}
