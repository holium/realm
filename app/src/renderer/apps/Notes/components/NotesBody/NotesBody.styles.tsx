import styled from 'styled-components';

import { Card, Flex } from '@holium/design-system/general';

export const NotesContainer = styled(Flex)`
  position: relative;
  flex: 1;
  min-height: 0;
`;

export const NotesViewContainer = styled(Flex)`
  flex: 1;
  height: 100%;
  padding: 12px 12px 0 0;
`;

export const NoteView = styled(Card)`
  flex: 1;
  height: 100%;
  border-radius: 12px 12px 0 0;
  border-bottom: none;
`;
