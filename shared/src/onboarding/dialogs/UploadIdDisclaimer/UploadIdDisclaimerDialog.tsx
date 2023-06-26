import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { UploadIdDisclaimerDialogBody } from './UploadIdDisclaimerDialogBody';

const UploadIdDisclaimerSchema = Yup.object().shape({
  iHaveRead: Yup.boolean().oneOf([true]),
});

type Props = {
  onBack?: () => void;
  onNext: () => void;
};

export const UploadIdDisclaimerDialog = ({ onBack, onNext }: Props) => (
  <OnboardDialog
    initialValues={{ iHaveRead: undefined }}
    validationSchema={UploadIdDisclaimerSchema}
    body={<UploadIdDisclaimerDialogBody />}
    onBack={onBack}
    onNext={onNext}
  />
);
