import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Input = styled(motion.input)`
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
`;

export const TextArea = styled(motion.textarea)`
  border-radius: var(--rlm-border-radius-4);
  background-color: var(--rlm-input-color);
  color: var(--rlm-text-color);
  pointer-events: all;
  appearance: none;
  outline: none;
  border: 1px transparent;
  &::placeholder {
    opacity: 0.5;
  }
`;
