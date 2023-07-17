import styled from 'styled-components';

import { ColorVariants } from '../../../util';
import { Flex } from '../../general/Flex/Flex';

export const CommCircle: any = styled(Flex)<{
  customBg?: ColorVariants;
  isDisabled: boolean;
}>`
  height: 44px;
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(var(--rlm-overlay-hover-rgba));
  transition: var(--transition);
  cursor: pointer;

  &:hover {
    background: rgba(var(--rlm-overlay-active-rgba));
  }

  ${({ customBg }) =>
    customBg &&
    `
    background: rgba(var(--rlm-${customBg}-rgba), 0.9);

    &:hover {
      background: rgba(var(--rlm-${customBg}-rgba));
    }
  `}

  ${({ isDisabled }) =>
    isDisabled &&
    `
    opacity: 0.5;
    cursor: default;
  `}
`;
