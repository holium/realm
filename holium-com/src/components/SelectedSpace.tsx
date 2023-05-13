import styled from 'styled-components';

import { Flex, FlexProps } from '@holium/design-system/general';

export const SelectedSpaceRow = styled(Flex)<FlexProps>`
  padding: 2px 8px 2px 4px;
  border-radius: 4px;
  &:active:not([disabled]) {
    transition: var(--transition);
    background-color: rgba(var(--rlm-overlay-active-rgba));
  }

  &:hover:not([disabled]) {
    transition: var(--transition);
    background-color: var(--rlm-overlay-hover);
    cursor: pointer;
  }

  &:focus:not([disabled]) {
    outline: none;
    background-color: rgba(var(--rlm-overlay-active-rgba));
  }
`;
