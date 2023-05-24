import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';
import { ChangeAccessCode } from '../../components/hosting/ChangeAccessCode';
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
    <AccountDialogTableRow title="ID">
      <AccountDialogDescription flex={1}>{serverId}</AccountDialogDescription>
    </AccountDialogTableRow>
    <AccountDialogTableRow title="URL">
      <AccountDialogDescription flex={1}>{serverUrl}</AccountDialogDescription>
    </AccountDialogTableRow>
    <ChangeAccessCode label="Code" serverCode={serverCode} />
  </AccountDialogTable>
);
