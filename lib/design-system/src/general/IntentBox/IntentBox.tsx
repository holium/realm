import styled, { css } from 'styled-components';

const BaseCss = css`
  padding: 16px;
  border-radius: 4px;
  font: var(--rlm-font-body);
`;

export const ErrorBox = styled.div`
  ${BaseCss}
  border: 1px solid rgba(var(--rlm-intent-alert-rgba));
  background-color: rgba(var(--rlm-intent-alert-rgba), 0.1);
  color: rgba(var(--rlm-intent-alert-rgba));
`;

export const SuccessBox = styled.div`
  ${BaseCss}
  border: 1px solid rgba(var(--rlm-intent-success-rgba));
  background-color: rgba(var(--rlm-intent-success-rgba), 0.1);
  color: rgba(var(--rlm-intent-success-rgba));
`;
