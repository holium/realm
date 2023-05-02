import styled from 'styled-components';

import { Flex } from '../../../general';

export const NoScrollBar: any = styled(Flex)`
  ::-webkit-scrollbar {
    display: none;
  }
`;
