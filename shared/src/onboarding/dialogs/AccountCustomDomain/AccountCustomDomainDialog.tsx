import { AccountDialog, SidebarSection } from '../../components/AccountDialog';
import { AccountCustomDomainDialogBody } from './AccountCustomDomainDialogBody';

type Props = {
  identities: string[];
  selectedIdentity: string;
  domain: string;
  dropletIp: string | undefined;
  submitting: boolean;
  errorMessage?: string;
  successMessage?: string;
  isUploadedIdentity: boolean;
  setSelectedIdentity: (patp: string) => void;
  onChangeDomain: (domain: string) => void;
  onSubmit: () => Promise<void>;
  onClickPurchaseId: () => void;
  onClickUploadId: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountCustomDomainDialog = ({
  identities,
  selectedIdentity,
  dropletIp,
  domain,
  submitting,
  errorMessage,
  successMessage,
  isUploadedIdentity,
  setSelectedIdentity,
  onChangeDomain,
  onSubmit,
  onClickPurchaseId,
  onClickUploadId,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    identities={identities}
    selectedIdentity={selectedIdentity}
    ships={[]}
    setSelectedIdentity={setSelectedIdentity}
    currentSection={SidebarSection.CustomDomain}
    isLoading={!dropletIp}
    isUploadedIdentity={isUploadedIdentity}
    onClickPurchaseId={onClickPurchaseId}
    onClickUploadId={onClickUploadId}
    onClickSidebarSection={onClickSidebarSection}
    onSubmit={onSubmit}
    onExit={onExit}
  >
    <AccountCustomDomainDialogBody
      dropletIp={dropletIp}
      errorMessage={errorMessage}
      successMessage={successMessage}
      domain={domain}
      submitting={submitting}
      onChangeDomain={onChangeDomain}
    />
  </AccountDialog>
);
