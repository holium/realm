import styled from 'styled-components';

import {
  MOBILE_WIDTH,
  OnboardDialogCard,
  onboardDialogCardCss,
  OnboardDialogDescription,
  OnboardDialogTitle,
  TABLET_WIDTH,
} from './OnboardDialog.styles';

export const AccountDialogCard = styled.form`
  ${onboardDialogCardCss}

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
  margin: 0;

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

export const AccountDialogDescription = styled(OnboardDialogDescription)`
  font-size: 14px;
  line-height: 17px;
`;
