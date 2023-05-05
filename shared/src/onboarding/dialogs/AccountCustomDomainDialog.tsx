import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import { AccountCustomDomainDialogBody } from './bodies/AccountCustomDomainDialogBody';

type Props = {
  patps: string[];
  selectedPatp: string;
  domain: string;
  dropletIp: string | undefined;
  submitting: boolean;
  errorMessage?: string;
  successMessage?: string;
  setSelectedPatp: (patp: string) => void;
  onChangeDomain: (domain: string) => void;
  onSubmit: () => Promise<void>;
  onClickBuyServer: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountCustomDomainDialog = ({
  patps,
  selectedPatp,
  dropletIp,
  domain,
  submitting,
  errorMessage,
  successMessage,
  setSelectedPatp,
  onChangeDomain,
  onSubmit,
  onClickBuyServer,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    patps={patps}
    selectedPatp={selectedPatp}
    setSelectedPatp={setSelectedPatp}
    currentSection={SidebarSection.CustomDomain}
    isLoading={!dropletIp}
    onClickBuyServer={onClickBuyServer}
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
