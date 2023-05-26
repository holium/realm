import { Flex } from '@holium/design-system/general';

import { AppleIcon } from '../icons/AppleIcon';
import { LinuxIcon } from '../icons/LinuxIcon';
import { WindowsIcon } from '../icons/WindowsIcon';
import { DownloadButton } from './DownloadButton';

export type DownloadRealmButtonsProps = {
  onDownloadMacM1: () => void;
  onDownloadMacIntel: () => void;
  onDownloadWindows: () => void;
  onDownloadLinux: () => void;
};

export const DownloadRealmButtons = ({
  onDownloadMacM1,
  onDownloadMacIntel,
  onDownloadWindows,
  onDownloadLinux,
}: DownloadRealmButtonsProps) => (
  <Flex gridColumn={4} gridRow={4} gap={12} mt={16} mb={32}>
    <Flex flexDirection="column" gap={12}>
      <DownloadButton
        icon={<AppleIcon />}
        hint="M1"
        onClick={onDownloadMacM1}
      />
      <DownloadButton icon={<WindowsIcon />} onClick={onDownloadWindows} />
    </Flex>
    <Flex flexDirection="column" gap={12}>
      <DownloadButton
        icon={<AppleIcon />}
        hint="Intel"
        onClick={onDownloadMacIntel}
      />
      <DownloadButton icon={<LinuxIcon />} onClick={onDownloadLinux} />
    </Flex>
  </Flex>
);
