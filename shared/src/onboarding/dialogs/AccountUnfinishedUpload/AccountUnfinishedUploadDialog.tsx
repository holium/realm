import { AccountDialog } from '../../components/AccountDialog';
import { SidebarSection } from '../../components/AccountDialogSidebar';
import { ThirdEarthShip } from '../../types';
import { AccountUnfinishedUploadDialogBody } from './AccountUnfinishedUploadDialogBody';

type Props = {
  ships: ThirdEarthShip[];
  selectedShipId: number | undefined;
  setSelectedShipId: (newId: number) => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onClickPurchaseId: () => void;
  onClickUploadId: () => void;
  onClickReuploadId: () => void;
  onClickExit: () => void;
};

export const AccountUnfinishedUploadDialog = ({
  ships,
  selectedShipId,
  setSelectedShipId,
  onClickSidebarSection,
  onClickPurchaseId,
  onClickUploadId,
  onClickReuploadId,
  onClickExit,
}: Props) => (
  <AccountDialog
    ships={ships}
    selectedShipId={selectedShipId}
    setSelectedShipId={setSelectedShipId}
    currentSection={SidebarSection.Hosting}
    onClickPurchaseId={onClickPurchaseId}
    onClickUploadId={onClickUploadId}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onClickExit}
  >
    <AccountUnfinishedUploadDialogBody
      key={selectedShipId}
      shipType={ships.find((ship) => ship.id === selectedShipId)?.ship_type}
      onClickReuploadId={onClickReuploadId}
    />
  </AccountDialog>
);
