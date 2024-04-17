import { AccountDialog } from '../../components/AccountDialog';
import { SidebarSection } from '../../components/AccountDialogSidebar';
import { ThirdEarthAlert, ThirdEarthShip } from '../../types';
import { AccountSupportDialogBody } from './AccountSupportDialogBody';

type Props = {
  alerts: ThirdEarthAlert[];
  ships: ThirdEarthShip[];
  selectedShipId: number | undefined;
  setSelectedShipId: (newId: number) => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountSupportDialog = ({
  alerts,
  ships,
  selectedShipId,
  setSelectedShipId,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    ships={ships}
    selectedShipId={selectedShipId}
    setSelectedShipId={setSelectedShipId}
    currentSection={SidebarSection.Support}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  >
    <AccountSupportDialogBody
      patp={ships.find((s) => s.id === selectedShipId)?.patp}
      alerts={alerts}
    />
  </AccountDialog>
);
