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
  onClickUploadPier: () => void;
  onClickReuploadPier: () => void;
  onClickExit: () => void;
};

export const AccountUnfinishedUploadDialog = ({
  ships,
  selectedShipId,
  setSelectedShipId,
  onClickSidebarSection,
  onClickPurchaseId,
  onClickUploadPier,
  onClickReuploadPier,
  onClickExit,
}: Props) => (
  <AccountDialog
    ships={ships}
    selectedShipId={selectedShipId}
    setSelectedShipId={setSelectedShipId}
    currentSection={SidebarSection.Hosting}
    onClickPurchaseId={onClickPurchaseId}
    onClickUploadPier={onClickUploadPier}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onClickExit}
  >
    <AccountUnfinishedUploadDialogBody
      key={selectedShipId}
      shipType={ships.find((ship) => ship.id === selectedShipId)?.ship_type}
      onClickReuploadPier={onClickReuploadPier}
    />
  </AccountDialog>
);
