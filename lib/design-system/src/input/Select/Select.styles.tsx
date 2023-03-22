import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

type SelectWrapperProps = {
  maxWidth?: number;
  disabled?: boolean;
};

export const SelectWrapper = styled(motion.div)<SelectWrapperProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
  height: 32px;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  min-height: 32px;
  padding: 4px 8px;
  border-radius: var(--rlm-border-radius-6);
  border: 1px solid rgba(var(--rlm-border-rgba));
  background-color: rgba(var(--rlm-input-rgba));
  user-select: none;
  cursor: pointer;

  select {
    border-radius: var(--rlm-border-radius-4);
    background-color: rgba(var(--rlm-input-rgba));
    color: rgba(var(--rlm-text-rgba));
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
      opacity: 0.6;
      &::placeholder {
        color: rgba(var(--rlm-text-rgba, #333333), 0.3);
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
  border: 1px solid rgba(var(--rlm-border-rgba));
  background-color: ${({ backgroundColor }) =>
    backgroundColor ? backgroundColor : 'rgba(var(--rlm-input-rgba))'};
  box-shadow: var(--rlm-box-shadow-1);
`;
