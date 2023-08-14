import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

export const NotesSidebarContainer = styled(Flex)`
  flex-direction: column;
  width: 300px;
  height: 100%;
  padding: 12px;
`;

export const NotesSidebarSectionsContainer = styled(Flex)`
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  min-height: 0;
`;

export const NotesSidebarSection = styled(Flex)`
  flex-direction: column;
  min-height: 70px;
`;

export const NotesSidebarSectionList = styled(Flex)`
  flex-direction: column;
  overflow-y: auto;
  min-height: 50px;
`;

export const NotesSectionDivider = styled(Flex)`
  height: 20px;
  gap: 12px;
  align-items: center;
`;

export const NotesSectionDividerText = styled(Text.Body)`
  font-size: 10px;
  padding-left: 8px;
  color: rgba(var(--rlm-text-rgba), 0.4);
`;

export const NotesSectionDividerBorder = styled(Flex)`
  flex: 1;
  height: 1px;
  background: rgba(var(--rlm-text-rgba), 0.1);
`;

export const NoNotesYet = styled(Text.Body)`
  padding: 12px;
  text-align: center;
  color: rgba(var(--rlm-text-rgba), 0.4);
`;
