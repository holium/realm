import { Flex } from 'renderer/components';
import styled from 'styled-components';

export const NoScrollBar: any = styled(Flex)`
  ::-webkit-scrollbar {
    display: none;
  }
`;
