import { Flex } from '@holium/design-system';
import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import { DownloadRealmBodyProps, DownloadRealmButtons } from './DownloadDialog';
import {
  AccountDialogDescription,
  AccountDialogTitle,
} from '../components/AccountDialog.styles';

type Props = DownloadRealmBodyProps & {
  patps: string[];
  selectedPatp: string;
  setSelectedPatp: (patp: string) => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountDownloadRealmDialog = ({
  patps,
  selectedPatp,
  setSelectedPatp,
  onDownloadMacM1,
  onDownloadMacIntel,
  onDownloadWindows,
  onDownloadLinux,
  onClickSidebarSection,
  onExit,
}: Props) => (
  <AccountDialog
    patps={patps}
    selectedPatp={selectedPatp}
    setSelectedPatp={setSelectedPatp}
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
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  />
);
