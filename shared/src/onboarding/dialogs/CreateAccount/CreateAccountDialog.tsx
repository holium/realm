import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { HoliumButton } from '@holium/design-system/os';

import { OnboardDialog } from '../../components/OnboardDialog';
import { CreateAccountDialogBody } from './CreateAccountDialogBody';

const CreateAccountSchema = Yup.object().shape({
  email: Yup.string().required('Email is required.').email('Invalid email.'),
  password: Yup.string()
    .required('Password is required.')
    .min(4, 'Password too short.'),
  confirmPassword: Yup.string()
    .required('Please confirm your password.')
    .oneOf([Yup.ref('password'), null], 'Passwords must match.'),
});

type Props = {
  prefilledEmail?: string;
  onBack: () => void;
  onNext: (values: FormikValues) => Promise<boolean>;
  onAlreadyHaveAccount?: () => void;
};

export const CreateAccountDialog = ({
  prefilledEmail,
  onBack,
  onNext,
  onAlreadyHaveAccount,
}: Props) => (
  <OnboardDialog
    initialValues={{
      email: prefilledEmail,
      password: undefined,
      confirmPassword: undefined,
    }}
    validationSchema={CreateAccountSchema}
    icon={<HoliumButton size={100} pointer={false} />}
    body={
      <CreateAccountDialogBody onAlreadyHaveAccount={onAlreadyHaveAccount} />
    }
    onBack={onBack}
    onNext={onNext}
  />
);
