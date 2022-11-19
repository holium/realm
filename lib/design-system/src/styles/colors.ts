import { css } from 'styled-components';

// The color variants maps to CSS variables injected by Realm.
type ColorVariants =
  | 'base'
  | 'accent'
  | 'input'
  | 'border'
  | 'window'
  | 'card'
  | 'text'
  | 'icon';

export interface ColorProps {
  bg?: ColorVariants;
  color?: ColorVariants;
  borderColor?: ColorVariants;
}

export const colorStyle = css<ColorProps>`
  ${(props) =>
    props.bg &&
    css`
      background-color: var(--rlm-${props.bg}-color);
    `}
  ${(props) =>
    props.color &&
    css`
      color: var(--rlm-${props.color}-color);
    `}
  ${(props) =>
    props.borderColor &&
    css`
      border-color: var(--rlm-${props.borderColor}-color);
    `}
`;
