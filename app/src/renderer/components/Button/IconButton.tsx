import styled, { css } from 'styled-components';
import {
  compose,
  space,
  layout,
  size,
  color,
  SizeProps,
  typography,
  SpaceProps,
  ColorProps,
  LayoutProps,
  TypographyProps,
} from 'styled-system';
import { motion } from 'framer-motion';
import { rgba, darken, lighten } from 'polished';
import type { ThemeType } from '../../theme';

type IProps = {
  ref?: unknown;
  disabled?: boolean;
  customBg?: string;
  hoverReveal?: boolean;
  canFocus?: boolean;
  size?: number;
  luminosity?: 'light' | 'dark';
  theme: ThemeType;
  color?: string; // hacky fix for linting error
} & SpaceProps &
  ColorProps &
  LayoutProps &
  SizeProps &
  TypographyProps;

export const IconButton = styled(styled(motion.button)<IProps>`
  border: 1px solid transparent;
  background-color: transparent;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  pointer-events: auto;
  height: ${(props: IProps) => `${props.size}px`};
  width: ${(props: IProps) => `${props.size}px`};
  svg {
    fill: ${(props: IProps) => props.color || props.theme.colors.icon.app};
    pointer-events: none;
    height: ${(props: IProps) => `${props.size! - props.theme.space[1]}px`};
    width: ${(props: IProps) => `${props.size! - props.theme.space[1]}px`};
  }
  /* border: 1px solid transparent; */
  border-radius: ${(props) => props.theme.containers.innerBorderRadius}px;
  -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
  -moz-box-sizing: border-box; /* Firefox, other Gecko */
  box-sizing: border-box; /* Opera/IE 8+ */
  outline: none;

  &:active {
    svg {
      fill: ${(props: IProps) => props.theme.colors.brand.primary};
    }
  }

  ${(props: IProps) =>
    props.hoverReveal
      ? css`
          opacity: 0;
          transition: 0.2s ease;
          padding: 3px;
          background: transparent;
          &:hover {
            opacity: 0.5;
            background: ${props.theme.colors.highlights.bgHighlight};
          }
        `
      : css`
          transition: 0.2s ease;
          &:hover {
            background: ${props.luminosity
              ? props.theme.colors.highlights.bgClearHighlight
              : props.theme.colors.highlights.bgHighlight};
            svg {
              fill: ${props.color || rgba(props.theme.colors.icon.app, 0.7)};
            }
          }
        `}
  ${(props: IProps) =>
    props.canFocus &&
    css`
      &:focus,
      &:active {
        transition: ${props.theme.transition};
        outline: none;
        svg {
          fill: ${darken('10%', props.theme.colors.brand.primary)};
        }
      }
    `}
  ${(props: IProps) =>
    props.customBg &&
    css`
      &:hover {
        transition: ${(props: IProps) => props.theme.transition};
        background-color: ${props.customBg
          ? rgba(lighten(0.1, props.customBg), 0.5)
          : 'inherit'};
      }
    `}

  

  &:disabled {
    color: ${(props) => props.theme.colors.ui.disabled};
    background-color: transparent;
    border-color: transparent;
    cursor: default;
    svg {
      fill: ${(props) => props.theme.colors.ui.disabled};
    }
    &:hover {
      cursor: default;
      color: ${(props) => props.theme.colors.ui.disabled};
      background-color: transparent;
      border-color: transparent;
    }
  }
`)<IProps>(
  {
    cursor: 'pointer',
    // '&:hover': {
    //   // @ts-expect-error stupid
    //   backgroundColor: (props: IProps) =>
    //     props.customBg ? darken(0.22, props.customBg) : 'initial',
    // },
  },
  compose(space, size, color, layout, typography)
);

IconButton.defaultProps = {
  size: 24,
  canFocus: false,
};
