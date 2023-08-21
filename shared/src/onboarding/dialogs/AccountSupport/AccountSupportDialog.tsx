import { AccountDialog } from '../../components/AccountDialog';
import { SidebarSection } from '../../components/AccountDialogSidebar';
import { ThirdEarthAlert, ThirdEarthShip } from '../../types';
import { AccountSupportDialogBody } from './AccountSupportDialogBody';

type Props = {
  alerts: ThirdEarthAlert[];
  ships: ThirdEarthShip[];
  selectedShipId: number | undefined;
  setSelectedShipId: (newId: number) => void;
  onClickPurchaseId: () => void;
  onClickUploadId: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountSupportDialog = ({
  alerts,
  ships,
  selectedShipId,
  setSelectedShipId,
  onClickPurchaseId,
  onClickUploadId,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    ships={ships}
    selectedShipId={selectedShipId}
    setSelectedShipId={setSelectedShipId}
    currentSection={SidebarSection.ContactSupport}
    onClickPurchaseId={onClickPurchaseId}
    onClickUploadId={onClickUploadId}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  >
    <AccountSupportDialogBody
      patp={ships.find((s) => s.id === selectedShipId)?.patp}
      alerts={alerts}
    />
  </AccountDialog>
);
