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
  | 'intent-warning'
  | 'intent-info';

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

export function convertDarkText(hexColor: string, themeMode: string = 'light') {
  let color = hexColor;
  if (themeMode === 'dark') {
    var c = hexColor.substring(1); // strip #
    var rgb = parseInt(c, 16); // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff; // extract red
    var g = (rgb >> 8) & 0xff; // extract green
    var b = (rgb >> 0) & 0xff; // extract blue

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    if (luma < 40) {
      // pick a different colour
      color = '#ffffff90';
    }
  }

  return color;
}

export const opacifyHexColor = (hexColor: string, opacity: number) =>
  hexColor + Math.round(opacity * 255).toString(16);
