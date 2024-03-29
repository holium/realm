import { ErrorBox, Flex } from '@holium/design-system/general';

import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';
import { DataSentIndicator } from '../../components/storage/DataSentIndicator';
import { DataStorageIndicator } from '../../components/storage/DataStorageIndicator';
import { StoragePassword } from '../../components/storage/StoragePassword';
import { StorageTroubleshoot } from '../../components/storage/StorageTroubleshoot';
import { AccountDialogTable } from '../AccountHosting/AccountHostingDialogBody';

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
  error: string | undefined;
  onClickRestartStorage: () => Promise<void>;
};

export const AccountStorageDialogBody = ({
  storageUrl,
  storageBucket,
  storagePassword,
  dataStorage,
  dataSent,
  error,
  onClickRestartStorage,
}: Props) => {
  if (error) {
    return (
      <>
        <ErrorBox>{error}</ErrorBox>
        <Flex flexDirection="column" alignItems="center">
          <StorageTroubleshoot onClick={onClickRestartStorage} />
        </Flex>
      </>
    );
  }

  return (
    <AccountDialogTable>
      <DataStorageIndicator dataStorage={dataStorage} />
      <DataSentIndicator dataSent={dataSent} />
      <AccountDialogTableRow title="Storage URL">
        <AccountDialogDescription flex={1}>
          {storageUrl}
        </AccountDialogDescription>
      </AccountDialogTableRow>
      <AccountDialogTableRow title="Storage Bucket">
        <AccountDialogDescription flex={1}>
          {storageBucket}
        </AccountDialogDescription>
      </AccountDialogTableRow>
      <StoragePassword storagePassword={storagePassword} />
      <AccountDialogTableRow title="Troubleshoot">
        <StorageTroubleshoot onClick={onClickRestartStorage} />
      </AccountDialogTableRow>
    </AccountDialogTable>
  );
};
