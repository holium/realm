import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { SftpDisclaimerDialogBody } from './SftpDisclaimerDialogBody';

const UploadIdDisclaimerSchema = Yup.object().shape({
  iHaveRead: Yup.boolean().oneOf([true]),
});

type Props = {
  onBack?: () => void;
  onNext: () => Promise<boolean>;
};

export const SftpDisclaimerDialog = ({ onBack, onNext }: Props) => (
  <OnboardDialog
    initialValues={{ iHaveRead: undefined }}
    validationSchema={UploadIdDisclaimerSchema}
    body={<SftpDisclaimerDialogBody />}
    onBack={onBack}
    onNext={onNext}
  />
);
