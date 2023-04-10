import styled from 'styled-components';
import { Flex } from '@holium/design-system';
import {
  MOBILE_WIDTH,
  OnboardDialogCard,
  OnboardDialogDescription,
  OnboardDialogTitle,
  TABLET_WIDTH,
} from './OnboardDialog.styles';

export const AccountDialogCard = styled(OnboardDialogCard)`
  height: 500px;
  flex-direction: row;
  padding: 16px;

  @media (max-width: ${TABLET_WIDTH}px) {
    height: auto;
    flex-direction: column;
  }

  @media (max-width: ${MOBILE_WIDTH}px) {
    min-height: 100%;
    justify-content: flex-start;
  }
`;

export const AccountDialogInnerCard = styled(OnboardDialogCard)`
  flex: 3;
  height: 100%;
  width: 100%;
  min-height: 0;
  background-color: rgba(var(--rlm-window-rgba));
  border-radius: 11px;
  padding: 16px;

  @media (max-width: ${TABLET_WIDTH}px) {
    flex: none;
    height: auto;
    width: 100%;
  }
`;

export const AccountDialogTitle = styled(OnboardDialogTitle)`
  font-size: 18px;
  line-height: 22px;
`;

export const AccountDialogSubtitle = styled(OnboardDialogDescription)`
  font-size: 12px;
  line-height: 15px;
  color: rgba(var(--rlm-text-rgba), 0.6);
`;

export const AccountDialogSidebar = styled(Flex)`
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

export const AccountDialogDescription = styled(OnboardDialogDescription)`
  font-size: 14px;
  line-height: 17px;
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
