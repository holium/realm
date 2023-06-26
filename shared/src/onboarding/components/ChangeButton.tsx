import styled from 'styled-components';

import { Button } from '@holium/design-system/general';

export const ChangeButton = styled(Button.TextButton)`
  height: 30px;
`;

export const GrayButton = styled(ChangeButton)`
  color: rgba(var(--rlm-text-rgba), 0.5);
  background-color: rgba(var(--rlm-text-rgba), 0.05);

  &:hover:not([disabled]) {
    background-color: rgba(184, 184, 184, 0.15);
  }
  &:active:not([disabled]) {
    background-color: rgba(184, 184, 184, 0.2);
  }
`;
