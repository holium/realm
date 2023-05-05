import _ from 'lodash';
import f from 'lodash/fp';
import { css } from 'styled-components';
// The color variants maps to CSS variables injected by Realm.
export type ColorVariants =
  | 'base'
  | 'accent'
  | 'input'
  | 'border'
  | 'window'
  | 'window-bg'
  | 'card'
  | 'text'
  | 'icon'
  | 'dock'
  | 'mouse'
  | 'brand'
  | 'intent-alert'
  | 'intent-success'
  | 'intent-caution';

export interface ColorProps {
  bg?: ColorVariants;
  fill?: ColorVariants;
  color?: ColorVariants;
  stroke?: ColorVariants;
  borderColor?: ColorVariants;
}

export const colorStyle = css<ColorProps>`
  ${(props) =>
    props.bg &&
    css`
      background-color: rgba(var(--rlm-${props.bg}-rgba));
    `}
  ${(props) =>
    props.color &&
    css`
      color: rgba(var(--rlm-${props.color}-rgba));
    `}
  ${(props) =>
    props.borderColor &&
    css`
      border-color: rgba(var(--rlm-${props.borderColor}-rgba));
    `}
`;

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

function luminosity(hexColor: string) {
  var c = hexColor.substring(1); // strip #
  var rgb = parseInt(c, 16); // convert rrggbb to decimal
  var r = (rgb >> 16) & 0xff; // extract red
  var g = (rgb >> 8) & 0xff; // extract green
  var b = (rgb >> 0) & 0xff; // extract blue

  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return luma;
}

export function contrastAwareBlackOrWhite(
  hexColor: string,
  targetColor: 'black' | 'white'
) {
  let color = targetColor === 'black' ? '#000000' : '#ffffff';
  let luma = luminosity(hexColor);
  if (luma < 40 && targetColor === 'black') {
    color = '#ffffff';
  }
  if (luma > 215 && targetColor === 'white') {
    color = '#000000';
  }
  return color;
}

/*
 *  If contrast is too low, override the color to be white or black.
 */
export function flipColorIfLowContrast(
  hexColor: string,
  themeMode: 'light' | 'dark' | undefined
) {
  let color = hexColor;
  let luma = luminosity(hexColor);
  if (luma < 40 && themeMode === 'dark') {
    color = '#ffffff';
  }
  if (luma > 215 && themeMode === 'light') {
    color = '#000000';
  }
  return color;
}

export const opacifyHexColor = (hexColor: string, opacity: number) =>
  hexColor + Math.round(opacity * 255).toString(16);

export function cleanNounColor(ux: string) {
  if (ux === '') {
    return '#000';
  }
  if (ux.startsWith('#')) {
    return ux;
  }
  if (ux.length > 2 && ux.substring(0, 2) === '0x') {
    const value = ux.substring(2).replace('.', '').padStart(6, '0');
    return `#${value}`;
  }

  const value = ux.replace('.', '').padStart(6, '0');
  return `#${value}`;
}

export function hexToRgb(hex: string) {
  if (hex.length === 4) {
    const r = hex.substring(1, 2);
    const g = hex.substring(2, 3);
    const b = hex.substring(3, 4);
    return {
      r: parseInt(`${r}${r}`, 16),
      g: parseInt(`${g}${g}`, 16),
      b: parseInt(`${b}${b}`, 16),
    };
  } else if (hex.length === 7) {
    const r = hex.substring(1, 3);
    const g = hex.substring(3, 5);
    const b = hex.substring(5, 7);
    return {
      r: parseInt(r, 16),
      g: parseInt(g, 16),
      b: parseInt(b, 16),
    };
  }

  return null;
}

export const rgbToHex = (r: number, g: number, b: number) => {
  const componentToHex = (c: number) => {
    var hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

export function rgbToString(rgb: { r: number; g: number; b: number } | null) {
  return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : rgb;
}

export function rgbToStringFull(
  rgb: { r: number; g: number; b: number } | null
) {
  return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'rgb(0, 0, 0)';
}

/* Converts to 'r,g,b,a' string. */
export const toRgbaString = (color: string): string => {
  const isHex = color.startsWith('#');
  const isRgb = color.startsWith('rgb');
  const isRgba = color.startsWith('rgba');

  if (isHex) {
    const rgbaString = hexToRgb(color);
    return rgbToString(rgbaString) as string;
  } else if (isRgba) {
    const rgbaString = color.replace('rgba(', '').replace(')', '');
    return rgbaString;
  } else if (isRgb) {
    const rgbaString = color.replace('rgb(', '').replace(')', '');
    return rgbaString;
  } else {
    return color;
  }
};

// ---------

// function dropWhile<T>(arr: T[], pred: (x: T) => boolean): T[] {
//   const newArray = arr.slice();

//   for (const item of arr) {
//     if (pred(item)) {
//       newArray.shift();
//     } else {
//       return newArray;
//     }
//   }

//   return newArray;
// }

// function chunk<T>(arr: T[], size: number): T[][] {
//   let chunk: T[] = [];
//   const newArray = [chunk];

//   for (let i = 0; i < arr.length; i++) {
//     if (chunk.length < size) {
//       chunk.push(arr[i]);
//     } else {
//       chunk = [arr[i]];
//       newArray.push(chunk);
//     }
//   }

//   return newArray;
// }

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
