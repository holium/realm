import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

type SelectWrapperProps = {
  maxWidth?: number;
  width?: number;
  disabled?: boolean;
};

export const SelectWrapper = styled(motion.div)<SelectWrapperProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
  height: 32px;
  width: ${({ width }) => (width ? `${width}px` : '100%')};
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  min-height: 32px;
  padding: 4px 8px;
  border-radius: var(--rlm-border-radius-6);
  border: 1px solid var(--rlm-border-color);
  background-color: var(--rlm-input-color);
  user-select: none;
  cursor: pointer;

  select {
    border-radius: var(--rlm-border-radius-4);
    background-color: var(--rlm-input-color);
    color: var(--rlm-text-color);
    pointer-events: all;
    flex: 1;
    height: inherit;
    appearance: none;
    outline: none;
    border: 1px transparent;
    &::placeholder {
      opacity: 0.5;
    }
  }
  ${({ disabled }) =>
    disabled &&
    css`
      pointer-events: none;
      input {
        pointer-events: none;
      }
      opacity: 0.6; /* correct opacity on iOS */
      &::placeholder {
        color: rgba(var(--rlm-text-color, #333333), 0.3);
        opacity: 1;
      }
      &:hover {
        border-color: transparent;
      }
    `}
`;

export const SelectDropdown = styled(motion.ul)<{ backgroundColor?: string }>`
  z-index: 20;
  top: 30px;
  left: 0px;
  padding: 4px;
  position: absolute;
  width: 100%;
  border-radius: 6px;
  gap: 2px;
  border: 1px solid var(--rlm-border-color);
  background-color: ${({ backgroundColor }) =>
    backgroundColor ? backgroundColor : 'var(--rlm-input-color)'};
  box-shadow: var(--rlm-box-shadow-1);
`;
