import * as Yup from 'yup';

import { ErrorBox } from '@holium/design-system/general';

import { OnboardDialog } from '../../components/OnboardDialog';
import { UploadIdDialogBody } from './UploadIdDialogBody';

const UploadIdSchema = Yup.object().shape({
  uploaded: Yup.boolean().oneOf([true]),
  uploading: Yup.boolean().oneOf([false]),
});

type Props = {
  fileName?: string;
  progress?: number;
  error?: string;
  onUpload: (file: File) => Promise<boolean>;
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

export const UploadIdDialog = ({
  fileName,
  progress,
  error,
  onUpload,
  onBack,
  onNext,
}: Props) => (
  <OnboardDialog
    initialValues={{ uploaded: undefined, uploading: false }}
    validationSchema={UploadIdSchema}
    body={
      <>
        <UploadIdDialogBody
          fileName={fileName}
          progress={progress}
          onUpload={onUpload}
        />
        {error && <ErrorBox>{error}</ErrorBox>}
      </>
    }
    onBack={onBack}
    onNext={onNext}
  />
);
