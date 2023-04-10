import { Flex } from '@holium/design-system';
import { DownloadButton } from '../components/DownloadButton';
import {
  OnboardDialogTitle,
  OnboardDialogDescription,
} from '../components/OnboardDialog.styles';
import { AppleIcon } from '../icons/AppleIcon';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { LinuxIcon } from '../icons/LinuxIcon';
import { WindowsIcon } from '../icons/WindowsIcon';
import { OnboardDialog } from '../components/OnboardDialog';

export type DownloadRealmBodyProps = {
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
}: DownloadRealmBodyProps) => (
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

type Props = DownloadRealmBodyProps & {
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

export const DownloadDialog = ({
  onDownloadMacM1,
  onDownloadMacIntel,
  onDownloadWindows,
  onDownloadLinux,
  onBack,
  onNext,
}: Props) => (
  <OnboardDialog
    icon={<DownloadIcon />}
    body={
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
    }
    nextText="Go to account"
    nextIcon={<ArrowRightIcon fill="accent" />}
    onBack={onBack}
    onNext={onNext}
  />
);
