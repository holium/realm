import styled from 'styled-components';

import { Row, Text } from '@holium/design-system/general';

export const NoteRowContainer = styled(Row)`
  min-width: 0;

  * {
    pointer-events: none;
  }
`;

export const NoteRowTitle = styled(Text.Body)`
  font-size: 13px;
  font-weight: 500;
  color: rgba(var(--rlm-text-rgba));
`;

export const NoteRowText = styled(Text.Body)`
  font-size: 12px;
  color: rgba(var(--rlm-text-rgba), 0.5);
  /* Truncate after 1 line */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
