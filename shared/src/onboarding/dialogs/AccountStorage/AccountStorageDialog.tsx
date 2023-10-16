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
  isLoading: boolean;
  error: string | undefined;
  onClickRestartStorage: () => Promise<void>;
  setSelectedShipId: (newId: number) => void;
  onClickPurchaseId: () => void;
  onClickUploadPier: () => void;
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
  isLoading,
  error,
  onClickRestartStorage,
  setSelectedShipId,
  onClickPurchaseId,
  onClickUploadPier,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    ships={ships}
    selectedShipId={selectedShipId}
    currentSection={SidebarSection.Storage}
    isLoading={isLoading}
    setSelectedShipId={setSelectedShipId}
    onClickPurchaseId={onClickPurchaseId}
    onClickUploadPier={onClickUploadPier}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  >
    <AccountStorageDialogBody
      key={selectedShipId}
      storageUrl={storageUrl as string}
      storageBucket={storageBucket as string}
      storagePassword={storagePassword as string}
      dataStorage={dataStorage}
      dataSent={dataSent}
      error={error}
      onClickRestartStorage={onClickRestartStorage}
    />
  </AccountDialog>
);
