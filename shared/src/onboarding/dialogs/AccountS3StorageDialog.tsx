import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import { AccountS3StorageDialogBody } from './bodies/AccountS3StorageDialogBody';

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
}: Props) => (
  <AccountDialog
    patps={patps}
    selectedPatp={selectedPatp}
    currentSection={SidebarSection.S3Storage}
    isLoading={!url || !s3Bucket || !s3Password}
    setSelectedPatp={setSelectedPatp}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  >
    <AccountS3StorageDialogBody
      url={url as string}
      s3Bucket={s3Bucket as string}
      s3Password={s3Password as string}
      dataStorage={dataStorage}
      dataSent={dataSent}
    />
  </AccountDialog>
);
