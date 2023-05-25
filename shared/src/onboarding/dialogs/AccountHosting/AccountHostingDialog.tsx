import { AccountDialog, SidebarSection } from '../../components/AccountDialog';
import { AccountHostingDialogBody } from './AccountHostingDialogBody';

type Props = {
  identities: string[];
  selectedIdentity: string;
  email: string | null;
  serverUrl: string | undefined;
  serverCode: string | undefined;
  serverMaintenanceWindow: number | undefined;
  setSelectedIdentity: (patp: string) => void;
  onClickChangeEmail: () => void;
  onClickChangePassword: () => void;
  onClickManageBilling: () => void;
  onClickGetNewAccessCode: () => void;
  onClickChangeMaintenanceWindow: () => void;
  onClickEjectId: () => void;
  onClickBuyIdentity: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountHostingDialog = ({
  identities,
  selectedIdentity,
  email,
  serverUrl,
  serverCode,
  serverMaintenanceWindow,
  setSelectedIdentity,
  onClickChangeEmail,
  onClickChangePassword,
  onClickManageBilling,
  onClickGetNewAccessCode,
  onClickChangeMaintenanceWindow,
  onClickEjectId,
  onClickBuyIdentity,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    identities={identities}
    selectedIdentity={selectedIdentity}
    setSelectedIdentity={setSelectedIdentity}
    currentSection={SidebarSection.Hosting}
    isLoading={
      !email ||
      !serverUrl ||
      !serverCode ||
      (!serverMaintenanceWindow && serverMaintenanceWindow !== 0)
    }
    onClickBuyIdentity={onClickBuyIdentity}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  >
    <AccountHostingDialogBody
      selectedIdentity={selectedIdentity}
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