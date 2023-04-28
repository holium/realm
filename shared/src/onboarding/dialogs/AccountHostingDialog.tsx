import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import { AccountHostingDialogBody } from './bodies/AccountHostingDialogBody';

type Props = {
  patps: string[];
  selectedPatp: string;
  email: string | null;
  shipUrl: string | undefined;
  shipCode: string | undefined;
  shipMaintenanceWindow: number | undefined;
  setSelectedPatp: (patp: string) => void;
  onClickChangeEmail: () => void;
  onClickChangePassword: () => void;
  onClickManageBilling: () => void;
  onClickGetNewAccessCode: () => void;
  onClickChangeMaintenanceWindow: () => void;
  onClickEjectId: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountHostingDialog = ({
  patps,
  selectedPatp,
  email,
  shipUrl,
  shipCode,
  shipMaintenanceWindow,
  setSelectedPatp,
  onClickChangeEmail,
  onClickChangePassword,
  onClickManageBilling,
  onClickGetNewAccessCode,
  onClickChangeMaintenanceWindow,
  onClickEjectId,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    patps={patps}
    selectedPatp={selectedPatp}
    setSelectedPatp={setSelectedPatp}
    currentSection={SidebarSection.Hosting}
    isLoading={!email || !shipUrl || !shipCode || !shipMaintenanceWindow}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  >
    <AccountHostingDialogBody
      selectedPatp={selectedPatp}
      email={email as string}
      shipUrl={shipUrl as string}
      shipCode={shipCode as string}
      shipMaintenanceWindow={shipMaintenanceWindow as number}
      onClickChangeEmail={onClickChangeEmail}
      onClickChangePassword={onClickChangePassword}
      onClickManageBilling={onClickManageBilling}
      onClickGetNewAccessCode={onClickGetNewAccessCode}
      onClickChangeMaintenanceWindow={onClickChangeMaintenanceWindow}
      onClickEjectId={onClickEjectId}
    />
  </AccountDialog>
);
