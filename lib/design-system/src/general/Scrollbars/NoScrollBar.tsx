import styled from 'styled-components';
import { Flex } from '../index';

export const NoScrollBar: any = styled(Flex)`
  ::-webkit-scrollbar {
    display: none;
  }
`;
