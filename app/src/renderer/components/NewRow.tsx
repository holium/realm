import styled, { css } from 'styled-components';
import { rgba, lighten, darken } from 'polished';
import { motion } from 'framer-motion';
import { ThemeType } from '../theme';

type RowProps = {
  theme: ThemeType;
  customBg?: string;
  pending?: boolean;
  gap?: number;
};

export const Row = styled(motion.div)<RowProps>`
  border-radius: 8px;
  width: 100%;
  padding: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  transition: ${(props: RowProps) => props.theme.transition};
  ${(props: RowProps) =>
    css`
      gap: ${props.gap || 10}px;
      &:hover {
        transition: ${props.theme.transition};
        background-color: ${props.customBg
          ? darken(0.025, props.customBg)
          : 'initial'};
      }
    `}
`;
