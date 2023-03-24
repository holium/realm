import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export const RadioLabelContainer = styled(motion.div)<{ hasIcon: boolean }>`
  position: relative;
  padding: ${(hasIcon) => (hasIcon ? '4px 8px 4px 4px' : '4px 4px')};
  * {
    cursor: pointer;
  }
`;

export const RadioLabel = styled(motion.label)<{ isSelected?: boolean }>`
  height: 26px;
  z-index: 14;
  font-size: 14px;
  position: relative;
  font-weight: 500;
  user-select: none;

  ${({ isSelected }) =>
    isSelected
      ? css`
          color: rgba(var(--rlm-accent-rgba));
        `
      : css`
          color: rgba(var(--rlm-text-rgba));
          background-color: rgba(var(--rlm-window-rgba));
          filter: brightness(0.98);
        `}
`;

export const RadioHighlight = styled(motion.label)<{ isSelected?: boolean }>`
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 13;
  border-radius: 5px;
  position: absolute;
  ${({ isSelected }) =>
    isSelected
      ? css`
          background-color: rgba(var(--rlm-accent-rgba), 0.12);
        `
      : css`
          background-color: rgba(var(--rlm-window-rgba));
          filter: brightness(0.98);
        `}
`;
