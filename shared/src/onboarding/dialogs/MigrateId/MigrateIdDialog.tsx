import { OnboardDialog } from '../../components/OnboardDialog';
import { MigrateIdDialogBody } from './MigrateIdDialogBody';

type Props = {
  fileName?: string;
  progress?: number;
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

export const MigrateIdDialog = ({
  fileName,
  progress,
  onBack,
  onNext,
}: Props) => {
  return (
    <OnboardDialog
      body={<MigrateIdDialogBody fileName={fileName} progress={progress} />}
      nextText="Confirm"
      onBack={onBack}
      onNext={onNext}
    />
  );
};
