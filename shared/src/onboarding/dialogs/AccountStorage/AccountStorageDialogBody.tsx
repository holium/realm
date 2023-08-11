import { useState } from 'react';

import { Button, Flex, Spinner, Text } from '@holium/design-system/general';

import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';
import { DataSentIndicator } from '../../components/storage/DataSentIndicator';
import { DataStorageIndicator } from '../../components/storage/DataStorageIndicator';
import { StoragePassword } from '../../components/storage/StoragePassword';
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
  onClickRestartStorage: () => Promise<string> | undefined;
};

type DebugState = 'uninitialized' | 'restarting' | 'restarted';

export const AccountStorageDialogBody = ({
  storageUrl,
  storageBucket,
  storagePassword,
  dataStorage,
  dataSent,
  onClickRestartStorage,
}: Props) => {
  const [debugState, setDebugState] = useState<DebugState>('uninitialized');

  const getDebugElement = () => {
    switch (debugState) {
      case 'uninitialized':
        return <Text.Body>Restart Storage</Text.Body>;
      case 'restarting':
        return <Spinner size={16} />;
      case 'restarted':
        return <Text.Body>Restarted</Text.Body>;
      default:
        return null;
    }
  };

  const handleOnClickRestartStorage = async () => {
    setDebugState('restarting');
    await onClickRestartStorage();
    setDebugState('restarted');
  };

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
        <Flex flex={1} justifyContent="flex-end">
          <Button.Secondary
            type="button"
            width="124px"
            height="28px"
            alignItems="center"
            justifyContent="center"
            disabled={['restarting', 'restarted'].includes(debugState)}
            onClick={handleOnClickRestartStorage}
          >
            {getDebugElement()}
          </Button.Secondary>
        </Flex>
      </AccountDialogTableRow>
    </AccountDialogTable>
  );
};
