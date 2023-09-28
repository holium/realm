import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { UploadPierDialogBody } from './UploadPierDialogBody';

const UploadPierSchema = Yup.object().shape({
  uploaded: Yup.boolean().oneOf([true]),
  uploading: Yup.boolean().oneOf([false]),
});

type Props = {
  fileName?: string;
  progress?: number;
  error?: string;
  hint?: string;
  onUpload: (file: File) => Promise<boolean>;
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

export const UploadPierDialog = ({
  fileName,
  progress,
  error,
  hint,
  onUpload,
  onBack,
  onNext,
}: Props) => (
  <OnboardDialog
    initialValues={{ uploaded: undefined, uploading: false }}
    validationSchema={UploadPierSchema}
    body={
      <UploadPierDialogBody
        fileName={fileName}
        progress={progress}
        error={error}
        hint={hint}
        onUpload={onUpload}
      />
    }
    onBack={onBack}
    onNext={onNext}
  />
);
