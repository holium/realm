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
import { ColorProps, colorStyle, getVar } from '../../util/colors';

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
  } & HTMLAttributes<HTMLButtonElement>;

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

const Base = styled(motion.button)<ButtonProps>`
  box-sizing: border-box;
  appearance: none;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  flex-basis: initial;
  font-size: 0.889rem;
  gap: 4px;
  border: 1px solid transparent;
  border-radius: var(--rlm-border-radius-4);
  transition: var(--transition);
  ${buttonStyles}
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

const Primary = styled(Base)<ButtonProps>`
  background-color: var(--rlm-accent-color);
  color: #ffffff;
  &:hover:not([disabled]) {
    background-color: ${() => darken(0.05, getVar('accent'))};
  }
  &:active:not([disabled]) {
    background-color: ${() => darken(0.075, getVar('accent'))};
  }
  svg {
    fill: #ffffff;
  }
`;

const Secondary = styled(Base)<ButtonProps>`
  color: var(--rlm-text-color);
  background-color: ${() => darken(0.025, getVar('window'))};
  &:hover:not([disabled]) {
    background-color: ${() => darken(0.05, getVar('window'))};
  }
  &:active:not([disabled]) {
    background-color: ${() => darken(0.075, getVar('window'))};
  }
`;

const Minimal = styled(Base)<ButtonProps>`
  color: var(--rlm-accent-color);
  background-color: ${() => rgba(getVar('accent'), 0.1)};
  &:hover:not([disabled]) {
    background-color: ${() => rgba(getVar('accent'), 0.15)};
  }
  &:active:not([disabled]) {
    background-color: ${() => rgba(getVar('accent'), 0.18)};
  }
  svg {
    fill: var(--rlm-accent-color);
  }
`;

const Transparent = styled(Base)<ButtonProps>`
  color: var(--rlm-text-color);
  background-color: transparent;
  &:hover:not([disabled]) {
    background-color: ${() => darken(0.025, getVar('window'))};
  }
  &:active:not([disabled]) {
    background-color: ${() => darken(0.05, getVar('window'))};
  }
  svg {
    fill: var(--rlm-text-color);
  }
`;

type TextButtonProps = ButtonProps & { showOnHover?: boolean };

const TextButton = styled(Base)<TextButtonProps>`
  color: ${(props) =>
    props.color
      ? `var(--rlm-${props.color}-color)`
      : 'var(--rlm-accent-color)'};

  background-color: ${(props) =>
    props.showOnHover
      ? 'transparent'
      : props.color
      ? rgba(getVar(props.color), 0.1)
      : rgba(getVar('accent'), 0.1)};
  &:hover:not([disabled]) {
    background-color: ${(props) =>
      props.color
        ? rgba(getVar(props.color), 0.15)
        : rgba(getVar('accent'), 0.15)};
  }
  &:active:not([disabled]) {
    background-color: ${(props) =>
      props.color
        ? rgba(getVar(props.color), 0.2)
        : rgba(getVar('accent'), 0.2)};
  }
  svg {
    fill: var(--rlm-accent-color);
  }
`;

export type IconButtonProps = ButtonProps & { showOnHover?: boolean };

const IconButton = styled(Base)<IconButtonProps>`
  padding: 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  &:hover:not([disabled]) {
    transition: var(--transition);
    background-color: var(--rlm-overlay-hover);
  }
  &:active:not([disabled]) {
    transition: var(--transition);
    background-color: var(--rlm-overlay-active);
  }
  &:focus:not([disabled]) {
    outline: none;
    background-color: var(--rlm-overlay-active);
  }
  svg {
    fill: var(--rlm-icon-color);
  }
`;

export const Button = {
  Base,
  Primary,
  Secondary,
  Minimal,
  Transparent,
  TextButton,
  IconButton,
};
