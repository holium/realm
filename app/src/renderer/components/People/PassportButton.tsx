import styled from 'styled-components';
import { motion } from 'framer-motion';

export const PassportButton = styled(motion.button)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  background-color: var(--background-color);
  height: 26px;
  width: 40px;
  transition: var(--transition);
  border-radius: 6px;
  svg {
    fill: rgba(var(--text-color), 0.7);
  }
  :hover {
    background-color: darken(0.1, var(--background-color));
    transition: var(--transition);
  }
`;
