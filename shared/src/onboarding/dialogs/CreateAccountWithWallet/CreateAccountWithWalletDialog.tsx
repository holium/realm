import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import {
  CreateAccountWithWalletDialogBody,
  CreateAccountWithWalletDialogFields,
} from './CreateAccountWithWalletDialogBody';

const CreateAccountSchema = Yup.object().shape({
  ethAddress: Yup.string()
    .required('ETH address is required.')
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid ETH address.'),
  contactEmail: Yup.string().email('Invalid email.'),
});

type Props = {
  onNext: (values: FormikValues) => Promise<boolean>;
};

export const CreateAccountWithWalletDialog = ({ onNext }: Props) => {
  const initialValues: Partial<CreateAccountWithWalletDialogFields> = {
    ethAddress: undefined,
    contactEmail: undefined,
  };

  return (
    <OnboardDialog
      initialValues={initialValues}
      validationSchema={CreateAccountSchema}
      body={<CreateAccountWithWalletDialogBody />}
      onNext={onNext}
    />
  );
};
