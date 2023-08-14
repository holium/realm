import { AccountDialog } from '../../components/AccountDialog';
import { SidebarSection } from '../../components/AccountDialogSidebar';
import { ThirdEarthShip } from '../../types';
import { AccountHostingDialogBody } from './AccountHostingDialogBody';

type Props = {
  ships: ThirdEarthShip[];
  selectedShipId: number | undefined;
  email: string | null;
  serverUrl: string | undefined;
  serverCode: string | undefined;
  serverMaintenanceWindow: number | undefined;
  setSelectedShipId: (newId: number) => void;
  onClickChangeEmail: () => void;
  onClickChangePassword: () => void;
  onClickManageBilling: () => void;
  onClickGetNewAccessCode: () => void;
  onClickChangeMaintenanceWindow: () => void;
  onClickEjectId: () => void;
  onClickPurchaseId: () => void;
  onClickUploadId: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountHostingDialog = ({
  selectedShipId,
  email,
  serverUrl,
  serverCode,
  serverMaintenanceWindow,
  ships,
  setSelectedShipId,
  onClickChangeEmail,
  onClickChangePassword,
  onClickManageBilling,
  onClickGetNewAccessCode,
  onClickChangeMaintenanceWindow,
  onClickEjectId,
  onClickPurchaseId,
  onClickUploadId,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    ships={ships}
    selectedShipId={selectedShipId}
    setSelectedShipId={setSelectedShipId}
    currentSection={SidebarSection.Hosting}
    isLoading={
      !email ||
      !serverUrl ||
      !serverCode ||
      (!serverMaintenanceWindow && serverMaintenanceWindow !== 0)
    }
    onClickPurchaseId={onClickPurchaseId}
    onClickUploadId={onClickUploadId}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  >
    <AccountHostingDialogBody
      selectedIdentity={ships.find((ship) => ship.id === selectedShipId)?.patp}
      email={email as string}
      serverUrl={serverUrl as string}
      serverCode={serverCode as string}
      serverMaintenanceWindow={serverMaintenanceWindow as number}
      onClickChangeEmail={onClickChangeEmail}
      onClickChangePassword={onClickChangePassword}
      onClickManageBilling={onClickManageBilling}
      onClickGetNewAccessCode={onClickGetNewAccessCode}
      onClickChangeMaintenanceWindow={onClickChangeMaintenanceWindow}
      onClickEjectId={onClickEjectId}
    />
  </AccountDialog>
);
