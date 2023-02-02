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

export const variantToCssVar = (colorVariant: ColorVariants) => {
  return `--rlm-${colorVariant}-color`;
};

export const getVar = (colorVariant: ColorVariants) => {
  const cssVar = variantToCssVar(colorVariant);
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .replace(/\s/g, '');

  return value;
};

export const getRawVar = (variable: string) => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
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
      background-color: var(${variantToCssVar(props.bg)});
    `}
  ${(props) =>
    props.color &&
    css`
      color: var(${variantToCssVar(props.color)});
    `}
  ${(props) =>
    props.borderColor &&
    css`
      border-color: var(${variantToCssVar(props.borderColor)});
    `}
`;
