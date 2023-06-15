import { OnboardDialog } from '../../components/OnboardDialog';
import { MigrateIdDialogBody } from './MigrateIdDialogBody';

type Props = {
  fileName?: string;
  progress?: number;
  onUpload: (file: File) => void;
  onClickClearUpload: () => void;
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

export const MigrateIdDialog = ({
  fileName,
  progress,
  onUpload,
  onClickClearUpload,
  onBack,
  onNext,
}: Props) => (
  <OnboardDialog
    body={
      <MigrateIdDialogBody
        fileName={fileName}
        progress={progress}
        onUpload={onUpload}
        onClickClearUpload={onClickClearUpload}
      />
    }
    nextText="Confirm"
    onBack={onBack}
    onNext={onNext}
  />
);
