import styled from 'styled-components';
import { motion } from 'framer-motion';

export const PassportButton = styled(motion.button)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--rlm-border-rgba));
  background-color: rgba(var(--rlm-window-rgba));
  height: 26px;
  width: 40px;
  transition: var(--transition);
  border-radius: 6px;
  /* svg {
    fill: rgba(var(--text-color), 0.7);
  } */
`;
