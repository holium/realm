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
  if (hsp > 127.5) {
    // the background image is too light
    return 'light';
  } else {
    return 'dark';
  }
}
