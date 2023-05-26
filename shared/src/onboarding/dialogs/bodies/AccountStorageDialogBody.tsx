import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';
import { DataSentIndicator } from '../../components/storage/DataSentIndicator';
import { DataStorageIndicator } from '../../components/storage/DataStorageIndicator';
import { StoragePassword } from '../../components/storage/StoragePassword';
import { AccountDialogTable } from './AccountHostingDialogBody';

type Props = {
  storageUrl: string;
  storageBucket: string;
  storagePassword: string;
  dataStorage: {
    used: number;
    total: number;
  };
  dataSent: {
    networkUsage: number;
    minioUsage: number;
  };
};

export const AccountStorageDialogBody = ({
  storageUrl,
  storageBucket,
  storagePassword,
  dataStorage,
  dataSent,
}: Props) => (
  <AccountDialogTable>
    <DataStorageIndicator dataStorage={dataStorage} />
    <DataSentIndicator dataSent={dataSent} />
    <AccountDialogTableRow title="Storage URL">
      <AccountDialogDescription flex={1}>{storageUrl}</AccountDialogDescription>
    </AccountDialogTableRow>
    <AccountDialogTableRow title="Storage Bucket">
      <AccountDialogDescription flex={1}>
        {storageBucket}
      </AccountDialogDescription>
    </AccountDialogTableRow>
    <StoragePassword storagePassword={storagePassword} />
  </AccountDialogTable>
);
