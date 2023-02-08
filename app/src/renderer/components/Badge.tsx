import React, { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { css } from 'styled-components';
import { Text } from './Text';
import { Box } from '@holium/design-system';
import { lighten } from 'polished';
import { ThemeType } from '../theme';

const Wrapper = styled(motion.div)<{ height: number; width: number }>`
  position: relative;
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
`;

interface BadgeStyleProps {
  theme: ThemeType;
  minimal?: boolean;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  background?: string;
  textColor?: string;
}

const BadgeStyle = styled(Box)<BadgeStyleProps>`
  position: absolute;
  display: block;

  ${(props: BadgeStyleProps) => css`
    font-size: 13px;
    ${props.background
      ? css`
          background: ${lighten(0.02, props.background)};
        `
      : css`
          background: ${lighten(0.02, props.theme.colors.brand.primary)};
        `}

    border-radius: ${props.minimal ? '50%' : '3px'};
    padding: ${props.minimal ? '0' : '0.5px 3px 0.5px 3px'};
    color: ${props.textColor
      ? props.textColor
      : props.theme.colors.text.primary};
    ${props.top &&
    css`
      top: ${props.top}px;
    `};
    ${props.left &&
    css`
      left: ${props.left}px;
    `}
    ${props.bottom &&
    css`
      bottom: ${props.bottom}px;
    `}
     ${props.right &&
    css`
      right: ${props.right}px;
    `}
    height: ${props.minimal ? '6px' : 'fit-content'};
    width: ${props.minimal ? '6px' : 'fit-content'};
  `}
`;

// const
interface BadgeProps {
  style?: any;
  wrapperHeight: number;
  wrapperWidth: number;
  children: React.ReactNode;
  minimal?: boolean;
  count: number;
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  background?: string;
  textColor?: string;
}

export const Badge: FC<BadgeProps> = (props: BadgeProps) => {
  const {
    style,
    minimal,
    top,
    bottom,
    right,
    left,
    count,
    wrapperHeight,
    wrapperWidth,
    children,
    background,
    textColor,
  } = props;

  return (
    <Wrapper style={style} height={wrapperHeight} width={wrapperWidth}>
      {children}
      <AnimatePresence>
        {count > 0 && (
          <BadgeStyle
            animate={{
              opacity: count > 0 ? 1 : 0,
            }}
            transition={{
              duration: 0.25,
            }}
            style={style}
            background={background}
            bottom={bottom}
            top={top}
            left={left}
            right={right}
            minimal={minimal}
            textColor={textColor}
          >
            {!minimal && <Text fontWeight={500}>{count}</Text>}
          </BadgeStyle>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};
Badge.defaultProps = {
  // top: 0,
  // right: 0,
  count: 0,
};
