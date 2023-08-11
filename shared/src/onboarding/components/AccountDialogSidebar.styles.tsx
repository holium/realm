import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

import { OnboardDialogDescription, TABLET_WIDTH } from './OnboardDialog.styles';

export const AccountDialogSidebarContainer = styled(Flex)`
  flex: 1;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: ${TABLET_WIDTH}px) {
    flex: none;
    gap: 32px;
    width: 100%;
    height: auto;
  }
`;

export const AccountDialogSidebarMenu = styled(Flex)`
  flex-direction: column;
  gap: 18px;

  @media (max-width: ${TABLET_WIDTH}px) {
    padding-bottom: 0;
  }
`;

export const AccountDialogSidebarMenuItemText = styled(
  OnboardDialogDescription
)<{
  isOpen: boolean;
}>`
  font-size: 13px;
  line-height: 15px;
  cursor: pointer;
  user-select: none;
  color: ${({ isOpen }) =>
    isOpen
      ? 'rgba(var(--rlm-accent-rgba))'
      : 'rgba(var(--rlm-text-rgba), 0.7)'};
`;
