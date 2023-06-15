import { OnboardDialog } from '../../components/OnboardDialog';
import { MigrateIdDialogBody } from './MigrateIdDialogBody';

type Props = {
  fileName?: string;
  progress?: number;
  onClickClearUpload: () => void;
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

export const MigrateIdDialog = ({
  fileName,
  progress,
  onClickClearUpload,
  onBack,
  onNext,
}: Props) => {
  return (
    <OnboardDialog
      body={
        <MigrateIdDialogBody
          fileName={fileName}
          progress={progress}
          onClickClearUpload={onClickClearUpload}
        />
      }
      nextText="Confirm"
      onBack={onBack}
      onNext={onNext}
    />
  );
};
