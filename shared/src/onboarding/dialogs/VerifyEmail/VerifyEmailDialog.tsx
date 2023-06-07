import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { Icon } from '@holium/design-system/general';

import { OnboardDialog } from '../../components/OnboardDialog';
import { VerifyEmailDialogBody } from './VerifyEmailDialogBody';

const VerifyEmailSchema = Yup.object().shape({
  verificationcode: Yup.string().required('Required'),
});

type Props = {
  onResend: () => void;
  onBack: () => void;
  onNext: (values: FormikValues) => Promise<boolean>;
};

export const VerifyEmailDialog = ({ onResend, onBack, onNext }: Props) => (
  <OnboardDialog
    initialValues={{ verificationcode: undefined }}
    validationSchema={VerifyEmailSchema}
    icon={<Icon name="AtSign" fill="accent" width="86px" height="86px" />}
    body={<VerifyEmailDialogBody onResend={onResend} />}
    onBack={onBack}
    onNext={onNext}
  />
);
