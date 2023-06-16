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
  onClickPurchaseId: () => void;
  onClickUploadId: () => void;
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
  onClickPurchaseId,
  onClickUploadId,
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
    onClickPurchaseId={onClickPurchaseId}
    onClickUploadId={onClickUploadId}
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
