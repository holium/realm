import styled from 'styled-components';

import { AccountDialogDescription } from './AccountDialog.styles';

type Props = {
  maxWidth?: string;
};

const DividerSection = styled.div<Props>`
  width: 100%;
  max-width: ${({ maxWidth }) => maxWidth && maxWidth};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 20px auto;
`;

const Divider = styled.div`
  flex: 1;
  height: 1px;
  background-color: var(--rlm-icon-color);
  opacity: 0.12;
`;

export const OrDivider = ({ maxWidth }: Props) => (
  <DividerSection maxWidth={maxWidth}>
    <Divider />
    <AccountDialogDescription>or</AccountDialogDescription>
    <Divider />
  </DividerSection>
);
