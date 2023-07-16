import styled from 'styled-components';

import { Card, Flex } from '@holium/design-system/general';

export const NoteViewContainer = styled(Flex)`
  flex: 1;
  height: 100%;
  padding: 12px 12px 0 0;
`;

export const NoteViewCard = styled(Card)`
  flex: 1;
  height: 100%;
  border-radius: 12px 12px 0 0;
  border-bottom: none;
`;
