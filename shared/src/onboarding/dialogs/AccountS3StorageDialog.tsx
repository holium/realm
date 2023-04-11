import { AccountDialogDescription } from '../components/AccountDialog.styles';
import { AccountDialogTableRow } from '../components/AccountDialogTableRow';
import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import { AccountDialogTable } from './AccountHostingDialog';
import { S3Password } from '../components/s3-storage/S3Password';
import { DataStorageIndicator } from '../components/s3-storage/DataStorageIndicator';
import { DataSentIndicator } from '../components/s3-storage/DataSentIndicator';
import { Flex, Spinner } from '@holium/design-system';

type Props = {
  patps: string[];
  selectedPatp: string;
  url: string | undefined;
  s3Bucket: string | undefined;
  s3Password: string | undefined;
  dataStorage: {
    used: number; // bytes
    total: number; // bytes
  };
  dataSent: {
    networkUsage: number; // MB
    minioUsage: number; // MB
  };
  setSelectedPatp: (patp: string) => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountS3StorageDialog = ({
  patps,
  selectedPatp,
  url,
  s3Bucket,
  s3Password,
  dataStorage,
  dataSent,
  setSelectedPatp,
  onClickSidebarSection,
  onExit,
}: Props) => {
  return (
    <AccountDialog
      patps={patps}
      selectedPatp={selectedPatp}
      currentSection={SidebarSection.S3Storage}
      setSelectedPatp={setSelectedPatp}
      onClickSidebarSection={onClickSidebarSection}
      onExit={onExit}
    >
      {!url || !s3Bucket || !s3Password ? (
        <Flex flex={1} justifyContent="center" alignItems="center">
          <Spinner size={8} />
        </Flex>
      ) : (
        <AccountDialogTable>
          <DataStorageIndicator dataStorage={dataStorage} />
          <DataSentIndicator dataSent={dataSent} />
          <AccountDialogTableRow title="URL">
            <AccountDialogDescription flex={1}>{url}</AccountDialogDescription>
          </AccountDialogTableRow>
          <AccountDialogTableRow title="S3 bucket">
            <AccountDialogDescription flex={1}>
              {s3Bucket}
            </AccountDialogDescription>
          </AccountDialogTableRow>
          <S3Password s3Password={s3Password} />
        </AccountDialogTable>
      )}
    </AccountDialog>
  );
};
