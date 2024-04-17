import { AccountDialog } from '../../components/AccountDialog';
import { SidebarSection } from '../../components/AccountDialogSidebar';
import { ThirdEarthShip } from '../../types';
import { AccountCustomDomainDialogBody } from './AccountCustomDomainDialogBody';

type Props = {
  ships: ThirdEarthShip[];
  selectedShipId: number | undefined;
  domain: string;
  dropletIp: string | undefined;
  submitting: boolean;
  errorMessage?: string;
  successMessage?: string;
  setSelectedShipId: (newId: number) => void;
  onChangeDomain: (domain: string) => void;
  onSubmit: () => Promise<void>;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountCustomDomainDialog = ({
  ships,
  selectedShipId,
  dropletIp,
  domain,
  submitting,
  errorMessage,
  successMessage,
  setSelectedShipId,
  onChangeDomain,
  onSubmit,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    ships={ships}
    selectedShipId={selectedShipId}
    setSelectedShipId={setSelectedShipId}
    currentSection={SidebarSection.CustomDomain}
    isLoading={!dropletIp}
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
