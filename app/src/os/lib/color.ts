import _ from 'lodash';
import f from 'lodash/fp';
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
  if (ux === '') {
    return '#000';
  }
  if (ux.length > 2 && ux.substring(0, 2) === '0x') {
    const value = ux.substring(2).replace('.', '').padStart(6, '0');
    return `#${value}`;
  }

  const value = ux.replace('.', '').padStart(6, '0');
  return `#${value}`;
}

export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
// ---------

function dropWhile<T>(arr: T[], pred: (x: T) => boolean): T[] {
  const newArray = arr.slice();

  for (const item of arr) {
    if (pred(item)) {
      newArray.shift();
    } else {
      return newArray;
    }
  }

  return newArray;
}

function chunk<T>(arr: T[], size: number): T[][] {
  let chunk: T[] = [];
  const newArray = [chunk];

  for (let i = 0; i < arr.length; i++) {
    if (chunk.length < size) {
      chunk.push(arr[i]);
    } else {
      chunk = [arr[i]];
      newArray.push(chunk);
    }
  }

  return newArray;
}

export function uxToHex(ux: string) {
  if (ux.length > 2 && ux.substring(0, 2) === '0x') {
    const value = ux.substring(2).replace('.', '').padStart(6, '0');
    return value;
  }

  const value = ux.replace('.', '').padStart(6, '0');
  return value;
}

// export const hexToUx = (hex: string): string => {
// if (hex.includes('#')) {
//   hex = hex.substring(1);
// }
//   const nonZeroChars = dropWhile(hex.split(''), (y) => y === '0');
//   const ux =
//     chunk(nonZeroChars.reverse(), 4)
//       .map((x) => {
//         return x.reverse().join('');
//       })
//       .reverse()
//       .join('.') || '0';

//   return `0x${ux}`;
// };
export const removeHash = (hex: string) => {
  if (hex.includes('#')) {
    hex = hex.substring(1);
  }
  return hex;
};

export const hexToUx = (hex: string) => {
  if (hex.includes('#')) {
    hex = hex.substring(1);
  }
  const ux = f.flow(
    f.reverse,
    f.chunk(4),
    // eslint-disable-next-line prefer-arrow-callback
    f.map((x) =>
      _.dropWhile(x, function (y: unknown) {
        return y === '0';
      })
        .reverse()
        .join('')
    ),
    f.reverse,
    f.join('.')
  )(hex.split(''));
  return `0x${ux}`;
};

export function normalizeUrbitColor(color: string): string {
  if (color.startsWith('#')) {
    return color;
  }

  const colorString = color.slice(2).replace('.', '').toUpperCase();
  const lengthAdjustedColor = _.padEnd(colorString, 6, _.last(colorString));
  return `#${lengthAdjustedColor}`;
}
