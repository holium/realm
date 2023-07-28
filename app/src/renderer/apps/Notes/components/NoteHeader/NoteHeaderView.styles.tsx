import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';
import { Input } from '@holium/design-system/inputs';

export const NoteHeaderContainer = styled(Flex)`
  position: relative;
  align-items: center;
  gap: 12px;
  padding: 20px 12px 0 12px;
`;

export const NoteHeaderTitleInput = styled(Input)`
  && {
    font-size: 20px;
    font-weight: 500;
    line-height: 32px;
    border: none;
    padding: 0;
    background-color: transparent;
  }
`;

export const AuthorText = styled(Text.Body)`
  font-size: 14px;
  opacity: 0.5;
`;

export const NoteUpdatedAtText = styled(Text.Body)`
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  opacity: 0.5;
`;
