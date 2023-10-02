import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { UploadPierDialogBody } from './UploadPierDialogBody';

type Props = {
  ipAddress?: string;
  password?: string;
  error?: string;
  onBack: () => void;
};

export const UploadPierDialog = ({
  ipAddress,
  password,
  error,
  onBack,
}: Props) => (
  <OnboardDialog
    initialValues={{}}
    validationSchema={Yup.object()}
    body={
      <UploadPierDialogBody
        ipAddress={ipAddress}
        password={password}
        error={error}
      />
    }
    onBack={onBack}
    hideNextButton
  />
);
