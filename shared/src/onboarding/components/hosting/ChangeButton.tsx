import { Button } from '@holium/design-system/general';
import styled from 'styled-components';

export const ChangeButton = styled(Button.TextButton)`
  height: 30px;
`;

export const ChangeButtonGray = styled(ChangeButton)`
  color: #b8b8b8;
  background-color: rgba(184, 184, 184, 0.12);
  &:hover:not([disabled]) {
    background-color: rgba(184, 184, 184, 0.15);
  }
  &:active:not([disabled]) {
    background-color: rgba(184, 184, 184, 0.2);
  }
`;
