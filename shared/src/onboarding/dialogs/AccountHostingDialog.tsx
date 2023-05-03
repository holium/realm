import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import { AccountHostingDialogBody } from './bodies/AccountHostingDialogBody';

type Props = {
  patps: string[];
  selectedPatp: string;
  email: string | null;
  serverUrl: string | undefined;
  serverCode: string | undefined;
  serverMaintenanceWindow: number | undefined;
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
  serverUrl,
  serverCode,
  serverMaintenanceWindow,
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
    isLoading={!email || !serverUrl || !serverCode || !serverMaintenanceWindow}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  >
    <AccountHostingDialogBody
      selectedPatp={selectedPatp}
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
