import styled from 'styled-components';
import { Input, Text } from '@holium/design-system';

export const TABLET_WIDTH = 800;
export const MOBILE_WIDTH = 400;

export const OnboardDialogCard = styled.form`
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
  margin: 0 auto;

  @media (max-width: ${TABLET_WIDTH}px) {
    min-height: 0;
    margin: 0 12px;
    padding: 69px 24px 24px 24px;
    gap: 42px;
  }

  @media (max-width: ${MOBILE_WIDTH}px) {
    align-self: flex-start;
    height: 100vh;
    margin: 0;
    padding: 32px;
    border-radius: 0;
  }
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

export const OnboardDialogBodyContainer = styled.div`
  display: flex;
  flex: 5;
  gap: 16px;
  flex-direction: column;
  justify-content: center;

  @media (max-width: ${TABLET_WIDTH}px) {
    width: 100%;
    max-width: 360px;
    flex: none;
  }
`;

export const OnboardDialogDescription = styled(Text.Body)`
  font-size: 16px;
  font-weight: 380;
  color: rgba(var(--rlm-text-rgba), 0.7);
  line-height: 1.5em;
`;

export const OnboardDialogInputLabel = styled(Text.Label)`
  font-size: 14px;
  line-height: 17px;
  font-weight: 500;
  margin-bottom: 4px;
`;

type OnboardDialogInputProps = {
  isError?: boolean;
};

export const OnboardDialogInput = styled(Input)<OnboardDialogInputProps>`
  flex: 1;
  padding: 11px 12px;
  border: 1px solid rgba(var(--rlm-border-rgba));
  border-radius: 6px;

  ${({ isError }) =>
    isError &&
    `
    border: 1px solid rgba(var(--rlm-intent-alert-rgba));
  `}
`;

export const OnboardDialogTitle = styled(Text.H1)`
  font-size: 22px;
  font-weight: 600;
  line-height: 26px;
  color: rgba(var(--rlm-text-rgba));
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
  margin: 0;
`;

export const OnboardDialogFooter = styled.footer`
  width: 100%;
  height: 30px;
`;
