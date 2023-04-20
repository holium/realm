import styled from 'styled-components';
import { Flex } from '../../general/Flex/Flex';

export const CommCircle = styled(Flex)<{ customBg: string }>`
  height: 44px;
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(var(--rlm-overlay-hover-rgba));
  transition: var(--transition);

  &:hover {
    background: rgba(var(--rlm-overlay-active-rgba));
  }
`;
