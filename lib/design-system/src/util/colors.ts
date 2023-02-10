import { css } from 'styled-components';

// The color variants maps to CSS variables injected by Realm.
export type ColorVariants =
  | 'base'
  | 'accent'
  | 'input'
  | 'border'
  | 'window'
  | 'card'
  | 'text'
  | 'icon'
  | 'dock'
  | 'intent-alert'
  | 'intent-success'
  | 'intent-warning'
  | 'intent-info';

export type ThemeVar = 'theme-mode';
export type StyleVars = ColorVariants | ThemeVar;

export const variantToColorVar = (colorVariant: ColorVariants) => {
  return `--rlm-${colorVariant}-color`;
};

export const variantToCssVar = (variable: ThemeVar) => {
  return `--rlm-${variable}`;
};

export const getVar = (variable: StyleVars) => {
  let cssVar: string;
  if (variable === 'theme-mode') {
    cssVar = variantToCssVar(variable);
  } else {
    cssVar = variantToColorVar(variable);
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
      background-color: var(${variantToColorVar(props.bg)});
    `}
  ${(props) =>
    props.color &&
    css`
      color: var(${variantToColorVar(props.color)});
    `}
  ${(props) =>
    props.borderColor &&
    css`
      border-color: var(${variantToColorVar(props.borderColor)});
    `}
`;
