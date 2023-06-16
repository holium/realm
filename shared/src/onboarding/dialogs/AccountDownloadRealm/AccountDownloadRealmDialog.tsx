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
  isUploadedIdentity: boolean;
  setSelectedIdentity: (patp: string) => void;
  onClickPurchaseId: () => void;
  onClickUploadId: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountDownloadRealmDialog = ({
  identities,
  selectedIdentity,
  isUploadedIdentity,
  setSelectedIdentity,
  onDownloadMacM1,
  onDownloadMacIntel,
  onDownloadWindows,
  onDownloadLinux,
  onClickPurchaseId,
  onClickUploadId,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    identities={identities ?? []}
    selectedIdentity={selectedIdentity ?? ''}
    setSelectedIdentity={setSelectedIdentity}
    currentSection={SidebarSection.DownloadRealm}
    isUploadedIdentity={isUploadedIdentity}
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
    onClickPurchaseId={onClickPurchaseId}
    onClickUploadId={onClickUploadId}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  />
);
