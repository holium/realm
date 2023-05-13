import styled from 'styled-components';

import { Flex } from '../Flex/Flex';

export const NoScrollBar = styled(Flex)`
  ::-webkit-scrollbar {
    display: none;
  }
`;
