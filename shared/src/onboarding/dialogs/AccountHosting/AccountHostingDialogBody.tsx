import styled from 'styled-components';

import { Button, Flex, Text } from '@holium/design-system/general';

import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';
import { ChangeAccessCode } from '../../components/ChangeAccessCode';
import { ChangeButton } from '../../components/ChangeButton';
import { TABLET_WIDTH } from '../../components/OnboardDialog.styles';
import { ChangeMaintenanceWindow } from './ChangeMaintenanceWindow';

export const AccountDialogTable = styled(Flex)`
  flex-direction: column;

  @media (max-width: ${TABLET_WIDTH}px) {
    gap: 24px;
  }
`;

export const AccountDialogTableRowContainer = styled(Flex)`
  flex: 1;
  align-items: center;
  justify-content: space-between;

  @media (max-width: ${TABLET_WIDTH}px) {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const GetNewAccessCodeContainer = styled(Flex)`
  width: 100%;
  height: 40px;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;

  @media (max-width: ${TABLET_WIDTH}px) {
    height: auto;
    align-items: flex-start;
    margin-top: -12px;
  }
`;

type Props = {
  selectedPatp: string;
  email: string;
  serverUrl: string;
  serverCode: string;
  serverMaintenanceWindow: number;
  onClickChangeEmail: () => void;
  onClickChangePassword: () => void;
  onClickManageBilling: () => void;
  onClickGetNewAccessCode: () => void;
  onClickChangeMaintenanceWindow: () => void;
  onClickEjectId: () => void;
};

export const AccountHostingDialogBody = ({
  selectedPatp,
  email,
  serverUrl,
  serverCode,
  serverMaintenanceWindow,
  onClickChangeEmail,
  onClickChangePassword,
  onClickManageBilling,
  onClickGetNewAccessCode,
  onClickChangeMaintenanceWindow,
  onClickEjectId,
}: Props) => (
  <>
    <AccountDialogTable>
      <AccountDialogTableRow title="Server ID">
        <AccountDialogDescription flex={1}>
          {selectedPatp}
        </AccountDialogDescription>
      </AccountDialogTableRow>
      <AccountDialogTableRow title="Email">
        <AccountDialogTableRowContainer>
          <AccountDialogDescription>{email}</AccountDialogDescription>
          <ChangeButton type="button" onClick={onClickChangeEmail}>
            Change email
          </ChangeButton>
        </AccountDialogTableRowContainer>
      </AccountDialogTableRow>
      <AccountDialogTableRow title="Password">
        <AccountDialogTableRowContainer>
          <AccountDialogDescription>• • • • • • • •</AccountDialogDescription>
          <ChangeButton type="button" onClick={onClickChangePassword}>
            Change password
          </ChangeButton>
        </AccountDialogTableRowContainer>
      </AccountDialogTableRow>
      <AccountDialogTableRow title="Payment">
        <AccountDialogTableRowContainer>
          <AccountDialogDescription flex={1}>
            Credit Card
          </AccountDialogDescription>
          <ChangeButton type="button" onClick={onClickManageBilling}>
            Manage billing
          </ChangeButton>
        </AccountDialogTableRowContainer>
      </AccountDialogTableRow>
      <AccountDialogTableRow title="URL">
        <AccountDialogDescription flex={1}>
          {serverUrl}
        </AccountDialogDescription>
      </AccountDialogTableRow>
      <ChangeAccessCode serverCode={serverCode} />
      <GetNewAccessCodeContainer>
        <ChangeButton type="button" onClick={onClickGetNewAccessCode}>
          Get new access code
        </ChangeButton>
      </GetNewAccessCodeContainer>

      <ChangeMaintenanceWindow
        maintenanceWindow={serverMaintenanceWindow}
        onClick={onClickChangeMaintenanceWindow}
      />
    </AccountDialogTable>
    <Flex
      flex={1}
      width="100%"
      alignContent="flex-end"
      justifyContent="center"
      flexWrap="wrap"
    >
      <Button.Transparent height="15px" onClick={onClickEjectId}>
        <Text.Body color="intent-alert">Eject ID</Text.Body>
      </Button.Transparent>
    </Flex>
  </>
);
