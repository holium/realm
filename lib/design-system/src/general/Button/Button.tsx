import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
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
import { ColorProps, colorStyle } from '../../util/colors';

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
    filter: brightness(0.975);
  }
  &:active:not([disabled]) {
    transition: var(--transition);
    filter: brightness(0.95);
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
  background-color: rgba(var(--rlm-accent-rgba));
  color: #ffffff;
  &:hover:not([disabled]) {
    background-color: rgba(var(--rlm-accent-rgba));
    filter: brightness(1.1);
  }
  &:active:not([disabled]) {
    background-color: rgba(var(--rlm-accent-rgba));
    filter: brightness(1.2);
  }
  svg {
    fill: #ffffff;
  }
`;

const Secondary = styled(Base)<ButtonProps>`
  color: rgba(var(--rlm-text-rgba));
  background-color: rgba(var(--rlm-window-rgba));
  filter: brightness(0.975);
  &:hover:not([disabled]) {
    background-color: rgba(var(--rlm-window-rgba));
    filter: brightness(0.975);
  }
  &:active:not([disabled]) {
    background-color: rgba(var(--rlm-window-rgba));
    filter: brightness(0.925);
  }
`;

const Minimal = styled(Base)<ButtonProps>`
  color: rgba(var(--rlm-accent-rgba));
  background-color: rgba(var(--rlm-accent-rgba), 0.1);
  &:hover:not([disabled]) {
    background-color: rgba(var(--rlm-accent-rgba), 0.15);
  }
  &:active:not([disabled]) {
    background-color: rgba(var(--rlm-accent-rgba), 0.3);
  }
  svg {
    fill: rgba(var(--rlm-accent-rgba));
  }
`;

const Transparent = styled(Base)<ButtonProps>`
  color: rgba(var(--rlm-text-rgba));
  background-color: transparent;
  &:hover:not([disabled]) {
    background-color: rgba(var(--rlm-window-rgba));
    filter: brightness(0.975);
  }
  &:active:not([disabled]) {
    background-color: rgba(var(--rlm-window-rgba));
    filter: brightness(0.95);
  }
  svg {
    fill: rgba(var(--rlm-text-rgba));
  }
`;

type TextButtonProps = ButtonProps & { showOnHover?: boolean };

const TextButton = styled(Base)<TextButtonProps>`
  font-weight: 500;
  padding: 4px 8px;
  color: ${(props) =>
    props.color
      ? `rgba(var(--rlm-${props.color}-rgba))`
      : 'rgba(var(--rlm-accent-rgba))'};

  background-color: ${(props) =>
    props.showOnHover
      ? 'transparent'
      : props.color
      ? `rgba(var(--rlm-${props.color}-rgba), 0.1)`
      : 'rgba(var(--rlm-accent-rgba), 0.1)'};
  &:hover:not([disabled]) {
    background-color: ${(props) =>
      props.color
        ? `rgba(var(--rlm-${props.color}-rgba), 0.15)`
        : 'rgba(var(--rlm-accent-rgba), 0.15)'};
  }
  &:active:not([disabled]) {
    background-color: ${(props) =>
      props.color
        ? `rgba(var(--rlm-${props.color}-rgba), 0.2)`
        : 'rgba(var(--rlm-accent-rgba), 0.2)'};
  }
  svg {
    fill: rgba(var(--rlm-accent-rgba));
  }
`;

export type IconButtonProps = ButtonProps & {
  showOnHover?: boolean;
  isSelected?: boolean;
  customColor?: string;
};

const IconButton = styled(Base)<IconButtonProps>`
  padding: 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${(props) =>
    props.isSelected ? 'var(--rlm-overlay-active)' : 'transparent'};
  &:hover:not([disabled]) {
    transition: var(--transition);
    background-color: rgba(var(--rlm-overlay-hover-rgba));
  }
  /* &:active:not([disabled]) {
    transition: var(--transition);
    background-color: rgba(var(--rlm-overlay-active-rgba));
  } */
  &:focus:not([disabled]) {
    outline: none;
    background-color: rgba(var(--rlm-overlay-active-rgba));
  }
  svg {
    fill: ${(props) =>
      props.customColor ? props.customColor : 'rgba(var(--rlm-icon-rgba))'};
  }
`;

// IconButton.defaultProps = {
//   size: 24
// }

export const Button = {
  Base,
  Primary,
  Secondary,
  Minimal,
  Transparent,
  TextButton,
  IconButton,
};
