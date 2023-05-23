import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { HoliumButton } from '@holium/design-system/os';

import { OnboardDialog } from '../../components/OnboardDialog';
import { ClaimTokenDialogBody } from './ClaimTokenDialogBody';

const ClaimTokenSchema = Yup.object().shape({
  password: Yup.string().required('Required'),
  confirmPassword: Yup.string()
    .required('Required')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

type Props = {
  email: string;
  onNext: (values: FormikValues) => Promise<boolean>;
};

export const ClaimTokenDialog = ({ email, onNext }: Props) => (
  <OnboardDialog
    initialValues={{ password: undefined, confirmPassword: undefined }}
    validationSchema={ClaimTokenSchema}
    icon={<HoliumButton size={100} pointer={false} />}
    body={<ClaimTokenDialogBody email={email} />}
    nextText="Claim"
    onNext={onNext}
  />
);
