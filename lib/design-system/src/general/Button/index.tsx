import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { darken, rgba } from 'polished';
import {
  background,
  BackgroundProps,
  border,
  BorderProps,
  ButtonStyleProps,
  compose,
  flexbox,
  FlexboxProps,
  grid,
  GridProps,
  layout,
  LayoutProps,
  opacity,
  OpacityProps,
  position,
  PositionProps,
  space,
  SpaceProps,
  style,
  textStyle,
  TextStyleProps,
  typography,
  TypographyProps,
} from 'styled-system';
import { ColorProps, colorStyle } from '../../styles/colors';
import { getVar } from '../../utils';

type TextDecorationOption = 'overline' | 'line-through' | 'underline';
type TextTransformOption = 'uppercase' | 'lowercase' | 'capitalize';

export type ButtonProps = {
  gap?: string | number | undefined;
  pointerEvents?: boolean;
} & BackgroundProps &
  ButtonStyleProps &
  ColorProps &
  FlexboxProps &
  GridProps &
  BorderProps &
  LayoutProps &
  OpacityProps &
  PositionProps &
  SpaceProps &
  TextStyleProps &
  TypographyProps & {
    textDecoration?:
      | TextDecorationOption
      | Array<TextDecorationOption | null | string>;
    textTransform?:
      | TextTransformOption
      | Array<TextTransformOption | null | string>;
  } & HTMLAttributes<any>;

const textDecoration = style({
  prop: 'textDecoration',
  cssProperty: 'textDecoration',
});

const pointerEvents = style({
  prop: 'pointerEvents',
  cssProperty: 'pointerEvents',
  transformValue: (value: boolean | undefined) => {
    if (value === undefined) return 'auto';
    return !value ? 'none' : 'auto';
  },
});

const textTransform = style({
  prop: 'textTransform',
  cssProperty: 'textTransform',
});

const buttonStyles = compose(
  background,
  flexbox,
  grid,
  layout,
  opacity,
  position,
  space,
  textStyle,
  textDecoration,
  pointerEvents,
  textTransform,
  typography,
  border
);

export const Base = styled(motion.button)<ButtonProps>`
  box-sizing: border-box;
  flex-basis: content;
  appearance: none;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid transparent;
  border-radius: var(--rlm-border-radius-4);
  transition: var(--transition);
  ${compose(buttonStyles)}
  ${colorStyle}
  &:hover:not([disabled]) {
    cursor: pointer;
    transition: var(--transition);
  }
  &:active:not([disabled]) {
    transition: var(--transition);
  }
  &:disabled {
    cursor: not-allowed !important;
    opacity: 0.5;
    transition: var(--transition);
  }
  svg {
    pointer-events: none;
  }
`;

export const Primary = styled(Base)<ButtonProps>`
  background-color: var(--rlm-accent-color);
  color: #ffffff;
  &:hover:not([disabled]) {
    background-color: ${() => darken(0.05, getVar('--rlm-accent-color'))};
  }
  &:active:not([disabled]) {
    background-color: ${() => darken(0.075, getVar('--rlm-accent-color'))};
  }
  svg {
    fill: #ffffff;
  }
`;

export const Secondary = styled(Base)<ButtonProps>`
  color: var(--rlm-text-color);
  background-color: ${() => darken(0.025, getVar('--rlm-window-color'))};
  &:hover:not([disabled]) {
    background-color: ${() => darken(0.05, getVar('--rlm-window-color'))};
  }
  &:active:not([disabled]) {
    background-color: ${() => darken(0.075, getVar('--rlm-window-color'))};
  }
`;

export const Minimal = styled(Base)<ButtonProps>`
  color: var(--rlm-accent-color);
  background-color: ${() => rgba(getVar('--rlm-accent-color'), 0.1)};
  &:hover:not([disabled]) {
    background-color: ${() => rgba(getVar('--rlm-accent-color'), 0.15)};
  }
  &:active:not([disabled]) {
    background-color: ${() => rgba(getVar('--rlm-accent-color'), 0.18)};
  }
  svg {
    fill: var(--rlm-accent-color);
  }
`;

export const Transparent = styled(Base)<ButtonProps>`
  color: var(--rlm-text-color);
  background-color: transparent;
  &:hover:not([disabled]) {
    background-color: ${() => darken(0.025, getVar('--rlm-window-color'))};
  }
  &:active:not([disabled]) {
    background-color: ${() => darken(0.05, getVar('--rlm-window-color'))};
  }
  svg {
    fill: var(--rlm-text-color);
  }
`;

type TextButtonProps = ButtonProps & { showOnHover: boolean };

export const TextButton = styled(Transparent)<TextButtonProps>`
  color: var(--rlm-accent-color);
  background-color: ${(props) =>
    props.showOnHover
      ? 'transparent'
      : rgba(getVar('--rlm-accent-color'), 0.1)};
  &:hover:not([disabled]) {
    background-color: ${() => rgba(getVar('--rlm-accent-color'), 0.15)};
  }
  &:active:not([disabled]) {
    background-color: ${() => rgba(getVar('--rlm-accent-color'), 0.2)};
  }
  svg {
    fill: var(--rlm-accent-color);
  }
`;

export const Button = {
  Base,
  Primary,
  Secondary,
  Minimal,
  Transparent,
  TextButton,
};
