import { motion } from 'framer-motion';
import styled from 'styled-components';

type Props = {
  isError?: boolean;
};

export const Input = styled(motion.input)<Props>`
  font-family: var(--rlm-font);
  background-color: rgba(var(--rlm-input-rgba));
  color: rgba(var(--rlm-text-rgba));
  pointer-events: all;
  flex: 1;
  height: inherit;
  padding: 0 6px;
  appearance: none;
  outline: none;
  border: ${({ isError }) =>
    isError
      ? '1px solid rgba(var(--rlm-intent-alert-rgba))'
      : '1px transparent'};

  &::placeholder {
    color: rgba(var(--rlm-text-rgba), 0.5);
  }
`;

export const TextArea = styled(motion.textarea)<Props>`
  font-family: var(--rlm-font);
  background-color: rgba(var(--rlm-input-rgba));
  color: rgba(var(--rlm-text-rgba));
  width: 100%;
  pointer-events: all;
  appearance: none;
  height: inherit;
  outline: none;
  border: ${({ isError }) =>
    isError
      ? '1px solid rgba(var(--rlm-intent-alert-rgba))'
      : '1px transparent'};

  &::placeholder {
    color: rgba(var(--rlm-text-rgba), 0.5);
  }
`;
