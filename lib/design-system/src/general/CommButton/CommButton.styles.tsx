import styled from 'styled-components';
import { Flex } from '../../general/Flex/Flex';

export const CommCircle = styled(Flex)<{ customBg: string }>`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ customBg }) => customBg};
  transition: var(--transition);

  &:hover {
    background: ${({ customBg }) => customBg};
    filter: brightness(0.975);
  }
`;
