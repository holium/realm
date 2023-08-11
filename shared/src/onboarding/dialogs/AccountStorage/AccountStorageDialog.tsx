import { AccountDialog } from '../../components/AccountDialog';
import { SidebarSection } from '../../components/AccountDialogSidebar';
import { ThirdEarthShip } from '../../types';
import { AccountStorageDialogBody } from './AccountStorageDialogBody';

type Props = {
  ships: ThirdEarthShip[];
  selectedShipId: number | undefined;
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
  setSelectedShipId: (newId: number) => void;
  onClickPurchaseId: () => void;
  onClickUploadId: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountStorageDialog = ({
  ships,
  selectedShipId,
  storageUrl,
  storageBucket,
  storagePassword,
  dataStorage,
  dataSent,
  setSelectedShipId,
  onClickPurchaseId,
  onClickUploadId,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    ships={ships}
    selectedShipId={selectedShipId}
    currentSection={SidebarSection.Storage}
    isLoading={!storageUrl || !storageBucket || !storagePassword}
    setSelectedShipId={setSelectedShipId}
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
