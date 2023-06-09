import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';
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

import { Text } from '../../general/Text/Text';
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
  backdrop-filter: blur(6px);
  background: rgba(var(--rlm-overlay-hover-rgba));
  gap: 6px;
  color: rgba(var(--rlm-text-rgba)) !important;
  ${Text.Custom} {
    color: rgba(var(--rlm-text-rgba)) !important;
  }
  border-radius: var(--rlm-border-radius-9);
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
  /* 
  &:hover {
    .block-author {
      transition: var(--transition);
      opacity: 0.5;
    }
  } */
  ${(props) =>
    (props.variant === 'overlay' || props.variant === 'content') &&
    css`
      padding: 0px;
      background: transparent;
      position: relative;
      .block-footer {
        display: flex;
        justify-content: space-between;
        border-radius: 0px 0px 2px 2px;
        padding: 4px 4px;
      }

      ${props.variant !== 'content' &&
      css`
        &:hover {
          .block-footer {
            background: rgba(var(--rlm-window-rgba));
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
  onLoaded?: () => void;
} & StyleProps;

type BlockElProps = BlockProps & { children?: React.ReactNode };

export const Block = ({
  id,
  mode = 'embed',
  variant = 'default',
  draggable = false,
  children,
  ...rest
}: BlockElProps) => {
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
