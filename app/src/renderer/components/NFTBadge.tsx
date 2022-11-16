import React, { FC } from 'react';
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';
import { darken, rgba, saturate } from 'polished';
import { ThemeType } from '../theme';
import { Text } from 'renderer/components';

type ThemeMode = 'light' | 'dark';

interface BadgeStyleProps {
  theme: ThemeType;
  baseColor: string;
  mode: ThemeMode;
}

const BadgeStyle = styled(motion.div)<BadgeStyleProps>`
  border-radius: 8px;
  padding: 4px 10px;
  ${(props: BadgeStyleProps) =>
    props.mode === 'light'
      ? css`
          /* Light mode */
          color: ${darken(0.4, saturate(0.3, props.baseColor))};
          background: ${rgba(
            darken(0.35, saturate(0.3, props.baseColor)),
            0.15
          )};
          transition: ${props.theme.transition};
        `
      : css`
          /* Dark mode */
          color: ${darken(0.3, saturate(0.9, props.baseColor))};
          background: ${rgba(
            darken(0.05, saturate(0.9, props.baseColor)),
            0.15
          )};
          transition: ${props.theme.transition};
        `};
`;

// const
interface BadgeProps {
  color: string;
  mode: ThemeMode;
}

export const NFTBadge: FC<BadgeProps> = (props: BadgeProps) => {
  const { color, mode } = props;

  return (
    <BadgeStyle
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      baseColor={color}
      mode={mode}
    >
      <Text fontStyle="italic" fontWeight="bolder" fontSize={3}>
        NFT
      </Text>
    </BadgeStyle>
  );
};
NFTBadge.defaultProps = {};
