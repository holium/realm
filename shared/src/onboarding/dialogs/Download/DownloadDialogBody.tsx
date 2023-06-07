import { Flex } from '@holium/design-system/general';

import {
  DownloadRealmButtons,
  DownloadRealmButtonsProps,
} from '../../components/DownloadRealmButtons';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';

type Props = DownloadRealmButtonsProps;

export const DownloadDialogBody = ({
  onDownloadMacM1,
  onDownloadMacIntel,
  onDownloadWindows,
  onDownloadLinux,
}: Props) => (
  <Flex flexDirection="column" gap={16} marginBottom={30}>
    <OnboardDialogTitle>Download Realm for desktop</OnboardDialogTitle>
    <OnboardDialogDescription>
      Realm is a community OS for crypto, groups, and friends. It’s a new OS
      build on a decentralized network.
    </OnboardDialogDescription>
    <DownloadRealmButtons
      onDownloadMacM1={onDownloadMacM1}
      onDownloadMacIntel={onDownloadMacIntel}
      onDownloadWindows={onDownloadWindows}
      onDownloadLinux={onDownloadLinux}
    />
  </Flex>
);
