import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { UploadPierDialogBody } from './UploadPierDialogBody';

const UploadPierSchema = Yup.object().shape({
  uploaded: Yup.boolean().oneOf([true]),
});

type Props = {
  ipAddress?: string;
  password?: string;
  error?: string;
  uploaded: boolean;
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

export const UploadPierDialog = ({
  ipAddress,
  password,
  error,
  uploaded,
  onBack,
  onNext,
}: Props) => (
  <OnboardDialog
    initialValues={{ uploaded: uploaded ? true : undefined }}
    validationSchema={UploadPierSchema}
    body={
      <UploadPierDialogBody
        ipAddress={ipAddress}
        password={password}
        error={error}
        uploaded={uploaded}
      />
    }
    onBack={onBack}
    onNext={onNext}
  />
);
