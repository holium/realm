import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { Flex } from '@holium/design-system/general';

import { OnboardDialog } from '../../components/OnboardDialog';
import { TermsDisclaimer } from '../../onboarding';
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
    <Flex flexDirection="column" alignItems="center">
      <OnboardDialog
        minimal
        initialValues={initialValues}
        validationSchema={CreateAccountSchema}
        body={
          <CreateAccountWithWalletDialogBody ethAddress="0xAC36fc83EB0B09ACd3244AD6637A8e8404724D6c" />
        }
        nextText="Confirm"
        onNext={onNext}
      />
      <TermsDisclaimer onClick={() => {}} />
    </Flex>
  );
};
