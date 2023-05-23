import { Flex } from '@holium/design-system/general';

import {
  DownloadRealmButtons,
  DownloadRealmButtonsProps,
} from '../../components/DownloadRealmButtons';
import { OnboardDialog } from '../../components/OnboardDialog';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { ArrowRightIcon } from '../../icons/ArrowRightIcon';
import { DownloadIcon } from '../../icons/DownloadIcon';

type Props = DownloadRealmButtonsProps & {
  onBack?: () => void;
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
    body={() => (
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
    )}
    nextText="Go to account"
    nextIcon={<ArrowRightIcon fill="accent" />}
    onBack={onBack}
    onNext={onNext}
  />
);
