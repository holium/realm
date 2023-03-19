import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { rgba, darken } from 'polished';
import { getVar } from '../../util/colors';

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
    selected
      ? css`
          color: var(--rlm-base-color);
        `
      : css`
          background-color: ${darken(0.015, getVar('base'))};
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
    selected
      ? css`
          background-color: ${rgba(getVar('accent'), 0.5)};
        `
      : css`
          background-color: ${darken(0.015, getVar('base'))};
        `}
`;
