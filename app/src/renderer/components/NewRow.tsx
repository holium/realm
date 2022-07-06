import styled, { css } from 'styled-components';
import { rgba, darken } from 'polished';
import { motion } from 'framer-motion';
import { ThemeType } from '../theme';

type RowProps = {
  small?: boolean;
  selected?: boolean;
  disabled?: boolean;
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
      ${!props.disabled
        ? css`
            &:hover {
              transition: ${props.theme.transition};
              background-color: ${props.customBg
                ? darken(0.025, props.customBg)
                : 'initial'};
            }
          `
        : css`
            pointer-events: none;
            opacity: 0.3;
          `}
      ${props.selected &&
      css`
        background-color: ${rgba(props.theme.colors.brand.primary, 0.2)};
        &:hover {
          transition: ${props.theme.transition};
          background-color: ${rgba(props.theme.colors.brand.primary, 0.2)};
        }
      `}
       ${props.small &&
      css`
        padding: 2px 2px;
      `}
    `}
`;
