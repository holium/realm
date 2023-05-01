import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';
import { AccountDialogTable } from './AccountHostingDialogBody';

type Props = {
  patp: string;
  url: string;
};

export const AccountSelfHostingDialogBody = ({ patp, url }: Props) => (
  <AccountDialogTable>
    <AccountDialogTableRow title="Server ID">
      <AccountDialogDescription flex={1}>{patp}</AccountDialogDescription>
    </AccountDialogTableRow>
    <AccountDialogTableRow title="Server URL">
      <AccountDialogDescription flex={1}>{url}</AccountDialogDescription>
    </AccountDialogTableRow>
  </AccountDialogTable>
);
