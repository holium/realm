import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { UploadPierDialogBody } from './UploadPierDialogBody';

const UploadPierSchema = Yup.object().shape({
  uploaded: Yup.boolean().oneOf([true]),
  uploading: Yup.boolean().oneOf([false]),
});

type Props = {
  ipAddress: string;
  password: string;
  error?: string;
  hint?: string;
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

export const UploadPierDialog = ({
  ipAddress,
  password,
  error,
  hint,
  onBack,
  onNext,
}: Props) => (
  <OnboardDialog
    initialValues={{ uploaded: undefined, uploading: false }}
    validationSchema={UploadPierSchema}
    body={
      <UploadPierDialogBody
        ipAddress={ipAddress}
        password={password}
        error={error}
        hint={hint}
      />
    }
    onBack={onBack}
    onNext={onNext}
  />
);
