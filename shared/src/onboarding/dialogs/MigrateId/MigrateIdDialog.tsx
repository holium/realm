import { OnboardDialog } from '../../components/OnboardDialog';
import { MigrateIdDialogBody } from './MigrateIdDialogBody';

type Props = {
  fileName?: string;
  progress?: number;
  setFile: (file: File) => void;
  onClickClearUpload: () => void;
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

export const MigrateIdDialog = ({
  fileName,
  progress,
  setFile,
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
          setFile={setFile}
          onClickClearUpload={onClickClearUpload}
        />
      }
      nextText="Confirm"
      onBack={onBack}
      onNext={onNext}
    />
  );
};
