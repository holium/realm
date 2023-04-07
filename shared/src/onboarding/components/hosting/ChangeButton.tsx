import styled from 'styled-components';
import { Button } from '@holium/design-system';

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
