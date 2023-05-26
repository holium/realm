import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import { AccountCustomDomainDialogBody } from './bodies/AccountCustomDomainDialogBody';

type Props = {
  identities: string[];
  selectedIdentity: string;
  domain: string;
  dropletIp: string | undefined;
  submitting: boolean;
  errorMessage?: string;
  successMessage?: string;
  setSelectedIdentity: (patp: string) => void;
  onChangeDomain: (domain: string) => void;
  onSubmit: () => Promise<void>;
  onClickBuyIdentity: () => void;
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
  setSelectedIdentity,
  onChangeDomain,
  onSubmit,
  onClickBuyIdentity,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    identities={identities}
    selectedIdentity={selectedIdentity}
    setSelectedIdentity={setSelectedIdentity}
    currentSection={SidebarSection.CustomDomain}
    isLoading={!dropletIp}
    onClickBuyIdentity={onClickBuyIdentity}
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
