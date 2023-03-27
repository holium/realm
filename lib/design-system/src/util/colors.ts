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
