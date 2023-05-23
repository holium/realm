import { DownloadRealmButtonsProps } from '../../components/DownloadRealmButtons';
import { OnboardDialog } from '../../components/OnboardDialog';
import { ArrowRightIcon } from '../../icons/ArrowRightIcon';
import { DownloadIcon } from '../../icons/DownloadIcon';
import { DownloadDialogBody } from './DownloadDialogBody';

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
}: Props) => {
  return (
    <OnboardDialog
      icon={<DownloadIcon />}
      body={
        <DownloadDialogBody
          onDownloadMacM1={onDownloadMacM1}
          onDownloadMacIntel={onDownloadMacIntel}
          onDownloadWindows={onDownloadWindows}
          onDownloadLinux={onDownloadLinux}
        />
      }
      nextText="Go to account"
      nextIcon={<ArrowRightIcon fill="accent" />}
      onBack={onBack}
      onNext={onNext}
    />
  );
};
