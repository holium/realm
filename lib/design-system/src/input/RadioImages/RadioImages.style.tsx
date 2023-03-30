import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

type RadioImageProps = { selected?: boolean };

export const RadioImage = styled(motion.img)<RadioImageProps>`
  height: 50px;
  -webkit-user-drag: none;
  z-index: 14;
  font-size: 14px;
  position: relative;
  margin-top: 2px;
  font-weight: 500;
  ${({ selected }) =>
    selected &&
    css`
      color: rgba(var(--rlm-base-rgba));
    `}
`;

export const RadioHighlight = styled(motion.label)<RadioImageProps>`
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 13;
  border-radius: 4px;
  position: absolute;
  ${({ selected }) =>
    selected &&
    css`
      background-color: rgba(var(--rlm-accent-rgba), 0.5);
    `}
`;
