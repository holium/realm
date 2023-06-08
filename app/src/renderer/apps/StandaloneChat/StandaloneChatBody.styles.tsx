import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

export const ResizeHandle = styled.div`
  z-index: 1;
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
`;

export const StandaloneChatContainer = styled(Flex)`
  width: 100%;
  height: calc(100% - 28px);
  margin-top: 28px;
  background: var(--rlm-dock-color);
`;
