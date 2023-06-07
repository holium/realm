import { Flex } from '@holium/design-system/general';

import { AccountDialog, SidebarSection } from '../../components/AccountDialog';
import {
  AccountDialogDescription,
  AccountDialogTitle,
} from '../../components/AccountDialog.styles';
import {
  DownloadRealmButtons,
  DownloadRealmButtonsProps,
} from '../../components/DownloadRealmButtons';

type Props = DownloadRealmButtonsProps & {
  identities: string[] | undefined;
  selectedIdentity: string | undefined;
  setSelectedIdentity: (patp: string) => void;
  onClickBuyIdentity: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountDownloadRealmDialog = ({
  identities,
  selectedIdentity,
  setSelectedIdentity,
  onDownloadMacM1,
  onDownloadMacIntel,
  onDownloadWindows,
  onDownloadLinux,
  onClickBuyIdentity,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    identities={identities ?? []}
    selectedIdentity={selectedIdentity ?? ''}
    setSelectedIdentity={setSelectedIdentity}
    currentSection={SidebarSection.DownloadRealm}
    customBody={
      <Flex
        flex={3}
        height="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={12}
      >
        <AccountDialogTitle style={{ fontSize: '22px' }}>
          Download Realm for desktop
        </AccountDialogTitle>
        <AccountDialogDescription maxWidth="400px" textAlign="center">
          Realm is a community OS for crypto, groups, and friends. It’s a new OS
          built on a decentralized network.
        </AccountDialogDescription>
        <DownloadRealmButtons
          onDownloadMacM1={onDownloadMacM1}
          onDownloadMacIntel={onDownloadMacIntel}
          onDownloadWindows={onDownloadWindows}
          onDownloadLinux={onDownloadLinux}
        />
      </Flex>
    }
    onClickBuyIdentity={onClickBuyIdentity}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  />
);
