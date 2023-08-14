import { Flex } from '@holium/design-system/general';

import { AccountDialog } from '../../components/AccountDialog';
import {
  AccountDialogDescription,
  AccountDialogTitle,
} from '../../components/AccountDialog.styles';
import { SidebarSection } from '../../components/AccountDialogSidebar';
import {
  DownloadRealmButtons,
  DownloadRealmButtonsProps,
} from '../../components/DownloadRealmButtons';
import { ThirdEarthShip } from '../../types';

type Props = DownloadRealmButtonsProps & {
  ships: ThirdEarthShip[];
  selectedShipId: number | undefined;
  setSelectedShipId: (newId: number) => void;
  onClickPurchaseId: () => void;
  onClickUploadId: () => void;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountDownloadRealmDialog = ({
  ships,
  selectedShipId,
  setSelectedShipId,
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
    ships={ships}
    selectedShipId={selectedShipId}
    setSelectedShipId={setSelectedShipId}
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
    onClickPurchaseId={onClickPurchaseId}
    onClickUploadId={onClickUploadId}
    onClickSidebarSection={onClickSidebarSection}
    onExit={onExit}
  />
);
