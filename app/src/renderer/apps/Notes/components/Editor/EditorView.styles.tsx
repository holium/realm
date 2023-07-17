import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

export const EditorContainer = styled(Flex)`
  position: relative;
  flex: 1;
  flex-direction: column;
  width: calc(100%);
  padding: 16px 16px 0 16px;
  font-size: 13px;
  font-family: var(--rlm-font);
  color: var(--rlm-text-color);
  overflow-y: auto;

  .ProseMirror {
    outline: none;
    line-height: 22px;
  }

  .move-to-end {
    cursor: text;
  }

  .tooltip {
    position: absolute;
    z-index: 1;
    background: red;
  }
`;
