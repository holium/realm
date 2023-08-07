import { useFormikContext } from 'formik';

import { Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogInputLabel,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { FormField } from '../../onboarding';

export type CreateAccountWithWalletFields = {
  ethAddress: string;
  contactEmail: string;
};

export const CreateAccountWithWalletDialogBody = () => {
  const { errors } = useFormikContext<CreateAccountWithWalletFields>();

  return (
    <>
      <OnboardDialogTitle pb={3}>Create your account</OnboardDialogTitle>
      <OnboardDialogDescription>
        You'll be able to login to Realm on mobile and the web with your wallet.
      </OnboardDialogDescription>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="eth-address">
          Eth Address
        </OnboardDialogInputLabel>
        <FormField
          name="eth-address"
          type="text"
          placeholder="0xAC36fc83EB0B09ACd3244AD6637A8e8404724D6c"
          isError={Boolean(errors?.ethAddress)}
        />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="contact-email">
          Contact Email
        </OnboardDialogInputLabel>
        <FormField
          name="contact-email"
          type="text"
          placeholder="user@holium.com"
          isError={Boolean(errors?.contactEmail)}
        />
      </Flex>
    </>
  );
};
