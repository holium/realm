import styled from 'styled-components';
import { Button, IconButtonProps } from '../..';

export const BarButton = styled(Button.IconButton)<IconButtonProps>`
  &:hover:not([disabled]) {
    background-color: rgba(var(--rlm-overlay-hover-rgba));
  }
  &:active:not([disabled]) {
    background-color: rgba(var(--rlm-overlay-active-rgba));
  }
`;
