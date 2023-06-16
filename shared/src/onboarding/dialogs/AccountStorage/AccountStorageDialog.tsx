import { AccountDialog, SidebarSection } from '../../components/AccountDialog';
import { AccountStorageDialogBody } from './AccountStorageDialogBody';

type Props = {
  identities: string[];
  selectedIdentity: string;
  storageUrl: string | undefined;
  storageBucket: string | undefined;
  storagePassword: string | undefined;
  dataStorage: {
    used: number; // bytes
    total: number; // bytes
  };
  dataSent: {
    networkUsage: number; // MB
    minioUsage: number; // MB
  };
  setSelectedIdentity: (patp: string) => void;
  onClickPurchaseId: () => void;
  onClickUploadId: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountStorageDialog = ({
  identities,
  selectedIdentity,
  storageUrl,
  storageBucket,
  storagePassword,
  dataStorage,
  dataSent,
  setSelectedIdentity,
  onClickPurchaseId,
  onClickUploadId,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    identities={identities}
    selectedIdentity={selectedIdentity}
    currentSection={SidebarSection.Storage}
    isLoading={!storageUrl || !storageBucket || !storagePassword}
    setSelectedIdentity={setSelectedIdentity}
    onClickPurchaseId={onClickPurchaseId}
    onClickUploadId={onClickUploadId}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  >
    <AccountStorageDialogBody
      storageUrl={storageUrl as string}
      storageBucket={storageBucket as string}
      storagePassword={storagePassword as string}
      dataStorage={dataStorage}
      dataSent={dataSent}
    />
  </AccountDialog>
);
