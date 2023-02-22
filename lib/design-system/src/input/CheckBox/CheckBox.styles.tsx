import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

export const CheckBoxInput = styled(motion.input)<{
  blankSvgString: string;
  checkedSvgString: string;
}>`
  width: 24px;
  height: 24px;
  background-color: transparent;
  outline: none;
  opacity: 0.7;
  appearance: none;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 18px 18px;
  ${({ blankSvgString }) => css`
    background-image: url('data:image/svg+xml;utf8,${blankSvgString}');
  `}

  &:checked {
    opacity: 1;
    ${({ checkedSvgString }) => css`
      background-image: url('data:image/svg+xml;utf8,${checkedSvgString}');
    `}
  }
  &:disabled {
    opacity: 0.42;
    cursor: not-allowed;
  }
`;
