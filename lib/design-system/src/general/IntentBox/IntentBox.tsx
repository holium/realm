import { ReactNode } from 'react';
import styled, { css } from 'styled-components';

const BaseCss = css`
  padding: 16px;
  border-radius: 4px;
  font: var(--rlm-font);
`;

/* Truncates overflow, max 4 lines */
const Truncator = styled.div`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
`;

const ErrorBoxContainer = styled.div`
  ${BaseCss}
  border: 1px solid rgba(var(--rlm-intent-alert-rgba));
  background-color: rgba(var(--rlm-intent-alert-rgba), 0.1);
  color: rgba(var(--rlm-intent-alert-rgba));
`;

type Props = { children: ReactNode };

export const ErrorBox = ({ children }: Props) => (
  <ErrorBoxContainer>
    <Truncator>{children}</Truncator>
  </ErrorBoxContainer>
);

export const SuccessBoxContainer = styled.div`
  ${BaseCss}
  border: 1px solid rgba(var(--rlm-intent-success-rgba));
  background-color: rgba(var(--rlm-intent-success-rgba), 0.1);
  color: rgba(var(--rlm-intent-success-rgba));
`;

export const SuccessBox = ({ children }: Props) => (
  <SuccessBoxContainer>
    <Truncator>{children}</Truncator>
  </SuccessBoxContainer>
);

export const InfoBoxContainer = styled.div`
  ${BaseCss}
  border: 1px solid rgba(var(--rlm-accent-rgba));
  background-color: rgba(var(--rlm-accent-rgba), 0.1);
  color: rgba(var(--rlm-accent-rgba));
`;

export const InfoBox = ({ children }: Props) => (
  <InfoBoxContainer>
    <Truncator>{children}</Truncator>
  </InfoBoxContainer>
);
