import styled from 'styled-components';
import { Button, IconButtonProps } from '../..';

export const BarButton = styled(Button.IconButton)<IconButtonProps>`
  &:hover:not([disabled]) {
    background-color: var(--rlm-overlay-hover);
  }
  &:active:not([disabled]) {
    background-color: var(--rlm-overlay-active);
  }
`;
