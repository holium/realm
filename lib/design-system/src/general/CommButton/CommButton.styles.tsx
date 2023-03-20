import styled from 'styled-components';
import { darken } from 'polished';
import { Flex } from '../../general/Flex/Flex';

export const CommCircle = styled(Flex)<{ customBg: string }>`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${(props) => props.customBg};
  transition: var(--transition);

  &:hover {
    background: ${(props) => darken(0.025, props.customBg)};
  }
`;
