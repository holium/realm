import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';
import { ChangeButton } from '../../components/hosting/ChangeButton';
import {
  AccountDialogTable,
  AccountDialogTableRowContainer,
} from './AccountHostingDialogBody';

type Props = {
  email: string;
  onClickChangeEmail: () => void;
  onClickChangePassword: () => void;
};

export const AccountSelfHostingDialogBody = ({
  email,
  onClickChangeEmail,
  onClickChangePassword,
}: Props) => (
  <AccountDialogTable>
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
  </AccountDialogTable>
);
