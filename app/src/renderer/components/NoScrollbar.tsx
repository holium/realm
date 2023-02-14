import styled from 'styled-components';
import { Flex } from 'renderer/components';

export const NoScrollBar: any = styled(Flex)`
  ::-webkit-scrollbar {
    display: none;
  }
`;
