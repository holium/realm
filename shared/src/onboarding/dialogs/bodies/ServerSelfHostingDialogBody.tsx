import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';
import { AccountDialogTable } from './AccountHostingDialogBody';

type Props = {
  serverId: string;
  serverUrl: string;
  serverCode: string;
};

export const ServerSelfHostingDialogBody = ({
  serverId,
  serverUrl,
  serverCode,
}: Props) => (
  <AccountDialogTable>
    <AccountDialogTableRow title="Server ID">
      <AccountDialogDescription flex={1}>{serverId}</AccountDialogDescription>
    </AccountDialogTableRow>
    <AccountDialogTableRow title="Server URL">
      <AccountDialogDescription flex={1}>{serverUrl}</AccountDialogDescription>
    </AccountDialogTableRow>
    <AccountDialogTableRow title="Server Code">
      <AccountDialogDescription flex={1}>{serverCode}</AccountDialogDescription>
    </AccountDialogTableRow>
  </AccountDialogTable>
);
