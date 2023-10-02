import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { UploadPierDisclaimerDialogBody } from './UploadPierDisclaimerDialogBody';

const UploadPierDisclaimerSchema = Yup.object().shape({
  iHaveRead: Yup.boolean().oneOf([true]),
});

type Props = {
  onBack?: () => void;
  onNext: () => Promise<boolean>;
};

export const UploadPierDisclaimerDialog = ({ onBack, onNext }: Props) => (
  <OnboardDialog
    initialValues={{ iHaveRead: undefined }}
    validationSchema={UploadPierDisclaimerSchema}
    body={<UploadPierDisclaimerDialogBody />}
    onBack={onBack}
    onNext={onNext}
  />
);
