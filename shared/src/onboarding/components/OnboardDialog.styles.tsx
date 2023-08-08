import { Form } from 'formik';
import styled, { css } from 'styled-components';

import { Text } from '@holium/design-system/general';

export const TABLET_WIDTH = 800;
export const MOBILE_WIDTH = 400;

export const onboardDialogCardCss = css`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 69px 32px 24px 32px;
  border-radius: 12px;
  background-color: rgba(var(--rlm-window-bg-rgba));
  border: 1px solid rgba(var(--rlm-border-rgba));
  max-width: 800px;
  min-height: 500px;
  backdrop-filter: var(--blur);
  box-shadow: var(--rlm-box-shadow-1);
  margin: 12px auto;

  @media (max-width: ${TABLET_WIDTH}px) {
    min-height: 0;
    margin-left: 12px;
    margin-right: 12px;
    padding: 69px 24px 24px 24px;
    gap: 42px;
  }

  @media (max-width: ${MOBILE_WIDTH}px) {
    align-self: flex-start;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 32px 24px;
    border-radius: 0;
  }
`;

export const OnboardDialogCard = styled(Form)<{ minimal?: boolean }>`
  ${onboardDialogCardCss}

  ${({ minimal }) =>
    minimal &&
    `
    max-width: 566px;
    min-height: 0;
    padding: 32px 32px 20px 32px;

    @media (max-width: ${TABLET_WIDTH}px) {
      margin-left: 12px;
      margin-right: 12px;
      padding: 32px 24px 20px 24px;
    }
  `}
`;

export const OnboardDialogBody = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  @media (max-width: ${TABLET_WIDTH}px) {
    gap: 42px;
    flex-direction: column;
  }
`;

export const OnboardDialogBodyContainer = styled.div<{ minimal: boolean }>`
  display: flex;
  flex: 5;
  min-width: 0;
  gap: 16px;
  flex-direction: column;
  justify-content: center;

  @media (max-width: ${TABLET_WIDTH}px) {
    width: 100%;
    flex: none;

    ${({ minimal }) =>
      !minimal &&
      `
      max-width: 360px;
    `}
  }
`;

export const OnboardDialogDescription = styled(Text.Body)`
  font-size: 16px;
  font-weight: 380;
  color: rgba(var(--rlm-text-rgba), 0.7);
  line-height: 1.5em;
`;

export const OnboardDialogDescriptionSmall = styled(Text.Body)`
  color: rgba(var(--rlm-text-rgba), 0.5);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

export const OnboardDialogDescriptionTiny = styled(
  OnboardDialogDescriptionSmall
)`
  font-size: 12px;
  line-height: 16px;
`;

export const OnboardDialogInputLabel = styled(Text.Label)`
  font-size: 14px;
  line-height: 17px;
  font-weight: 500;
  margin-bottom: 4px;
`;

export const OnboardDialogInputLabelSmall = styled(OnboardDialogInputLabel)`
  color: rgba(var(--rlm-text-rgba), 0.6);
  font-family: Rubik;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: 0.72px;
  text-transform: uppercase;
`;

export const OnboardDialogTitle = styled(Text.H1)`
  font-size: 22px;
  font-weight: 600;
  line-height: 26px;
  color: rgba(var(--rlm-text-rgba));
`;

export const OnboardDialogTitleBig = styled(OnboardDialogTitle)`
  font-size: 26px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const OnboardDialogSubTitle = styled(Text.Body)`
  font-size: 13px;
  font-weight: 600;
  line-height: 15px;
  color: rgba(var(--rlm-text-rgba));
`;

export const OnboardDialogIconContainer = styled.div`
  display: flex;
  flex: 3;
  justify-content: center;

  @media (max-width: ${TABLET_WIDTH}px) {
    flex: none;
  }
`;

export const OnboardDialogBackButton = styled.button`
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
  margin: 0 16px 0 0;
`;

export const OnboardDialogFooter = styled.footer`
  width: 100%;
  height: 30px;

  @media (max-width: ${TABLET_WIDTH}px) {
    flex-direction: column;
  }
`;

export const OnboardDialogFooterBackButtonFlex = styled.div`
  flex: 3;
  align-items: center;

  @media (max-width: ${TABLET_WIDTH}px) {
    flex: none;
  }
`;

export const OnboardDialogButtonText = styled(Text.Body)`
  font-size: 16px;
  font-weight: 500;
  line-height: 19px;
  color: rgba(var(--rlm-accent-rgba));
  user-select: none;
`;
