import { motion } from 'framer-motion';
import { FC } from 'react';
import styled, { css } from 'styled-components';
import { Text, Box } from '../..';

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
  textStyle,
  TextStyleProps,
  typography,
  TypographyProps,
} from 'styled-system';
import { ColorProps, colorStyle } from '../../util/colors';

type BlockMode = 'embed' | 'display';

type StyleProps = {
  mode?: BlockMode;
  variant?: 'default' | 'overlay' | 'content';
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
  TypographyProps;

export const BlockStyle = styled(motion.span)<StyleProps>`
  display: inline-flex;
  flex-direction: column;
  box-sizing: content-box;
  align-items: flex-start;
  padding: 6px;
  gap: 6px;
  background: var(--rlm-window-color);
  color: var(--rlm-text-color) !important;
  ${Text.Custom} {
    color: var(--rlm-text-color) !important;
  }
  backdrop-filter: blur(6px);
  border-radius: var(--rlm-border-radius-9);
  border: 1px solid transparent;
  width: ${(props) => (props.width ? `${props.width}px` : 'initial')};
  ${(props) =>
    props.mode === 'display' &&
    css`
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
    `}

  .block-author {
    transition: var(--transition);
    opacity: 0;
  }

  &:hover {
    .block-author {
      transition: var(--transition);
      opacity: 0.5;
    }
  }
  ${(props) =>
    (props.variant === 'overlay' || props.variant === 'content') &&
    css`
      padding: 0px;
      border: 0px solid transparent;
      background: transparent;
      position: relative;
      .block-footer {
        transition: var(--transition);
        position: absolute;
        display: flex;
        justify-content: space-between;
        background: transparent;
        border-radius: 0px 0px 2px 2px;
        padding: 4px 4px;
        bottom: 0px;
        left: 0px;
        right: 0px;
      }

      ${props.variant !== 'content' &&
      css`
        &:hover {
          .block-footer {
            transition: var(--transition);
            opacity: 1;
            background: var(--rlm-window-color);
          }
          .block-author {
            opacity: 1;
          }
        }
      `}
    `}
  ${compose(
    background,
    flexbox,
    grid,
    layout,
    opacity,
    position,
    space,
    textStyle,
    typography,
    border
  )}
  ${colorStyle}
`;

export type BlockProps = {
  id: string;
  draggable?: boolean;
} & StyleProps;

type BlockElProps = BlockProps & { children?: React.ReactNode };

export const Block: FC<BlockElProps> = (props: BlockElProps) => {
  const {
    id,
    mode = 'embed',
    variant = 'default',
    draggable = false,
    children,
    ...rest
  } = props;

  return (
    <BlockStyle
      id={id}
      mode={mode}
      width={rest.width}
      variant={variant}
      {...(draggable && {
        drag: true,
        dragTransition: { bounceStiffness: 600, bounceDamping: 20 },
        dragMomentum: false,
        whileTap: { cursor: 'grabbing' },
      })}
      {...rest}
    >
      {children}
    </BlockStyle>
  );
};
