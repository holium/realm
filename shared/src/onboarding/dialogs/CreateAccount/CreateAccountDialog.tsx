import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { HoliumButton } from '@holium/design-system/os';

import { OnboardDialog } from '../../components/OnboardDialog';
import { CreateAccountDialogBody } from './CreateAccountDialogBody';

// Don't validate fields until the user has interacted with them.
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
  onAlreadyHaveAccount: () => void;
  onNext: (values: FormikValues) => Promise<boolean>;
};

export const CreateAccountDialog = ({
  prefilledEmail,
  onAlreadyHaveAccount,
  onNext,
}: Props) => (
  <OnboardDialog
    initialValues={{
      email: prefilledEmail,
      password: undefined,
      confirmPassword: undefined,
    }}
    validationSchema={CreateAccountSchema}
    icon={<HoliumButton size={100} pointer={false} />}
    body={() => (
      <CreateAccountDialogBody onAlreadyHaveAccount={onAlreadyHaveAccount} />
    )}
    onNext={onNext}
  />
);
