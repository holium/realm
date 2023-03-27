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
  | 'intent-alert'
  | 'intent-success'
  | 'intent-warning'
  | 'intent-info';

type ThemeVar = 'theme-mode';
type StyleVars = ColorVariants | ThemeVar;

const variantToRgbCssVar = (colorVariant: ColorVariants) => {
  return `--rlm-${colorVariant}-rgba`;
};

const variantToCssVar = (variable: ThemeVar) => {
  return `--rlm-${variable}`;
};

export const getVar = (variable: StyleVars) => {
  let cssVar: string;
  if (variable === 'theme-mode') {
    cssVar = variantToCssVar(variable);
  } else {
    cssVar = variantToRgbCssVar(variable);
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .replace(/\s/g, '');

  return value;
};

export interface ColorProps {
  bg?: ColorVariants;
  color?: ColorVariants;
  borderColor?: ColorVariants;
}

export const colorStyle = css<ColorProps>`
  ${(props) =>
    props.bg &&
    css`
      background-color: rgba(var(${variantToRgbCssVar(props.bg)}));
    `}
  ${(props) =>
    props.color &&
    css`
      color: rgba(var(${variantToRgbCssVar(props.color)}));
    `}
  ${(props) =>
    props.borderColor &&
    css`
      border-color: rgba(var(${variantToRgbCssVar(props.borderColor)}));
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

export function convertDarkText(hexColor: string) {
  let color = hexColor;
  if (getVar('theme-mode') === 'dark') {
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
