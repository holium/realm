import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

import { STANDALONE_CHAT_TITLEBAR_HEIGHT } from 'renderer/system/titlebar/Titlebar';

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
  height: calc(100% - ${STANDALONE_CHAT_TITLEBAR_HEIGHT}px);
  margin-top: ${STANDALONE_CHAT_TITLEBAR_HEIGHT}px;
  border-top: 1px solid var(--rlm-base-color);
`;
