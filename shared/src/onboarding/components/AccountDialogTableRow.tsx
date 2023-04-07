import { ReactNode } from 'react';
import styled from 'styled-components';
import { Flex } from '@holium/design-system';
import { OnboardDialogSubTitle, TABLET_WIDTH } from './OnboardDialog.styles';

const AccountDialogTableRowStyled = styled(Flex)`
  height: 40px;
  align-items: center;
  gap: 16px;

  @media (max-width: ${TABLET_WIDTH}px) {
    height: auto;
    align-items: flex-start;
    gap: 4px;
    flex-direction: column;
  }
`;

type Props = {
  title: string;
  children: ReactNode;
};

export const AccountDialogTableRow = ({ title, children }: Props) => (
  <AccountDialogTableRowStyled>
    <OnboardDialogSubTitle width="120px">{title}</OnboardDialogSubTitle>
    {children}
  </AccountDialogTableRowStyled>
);
