import { useFormikContext } from 'formik';

import { Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescriptionSmall,
  OnboardDialogInputLabel,
  OnboardDialogTitleBig,
} from '../../components/OnboardDialog.styles';
import { FormField } from '../../onboarding';

type Props = {
  ethAddress: string;
};

export type CreateAccountWithWalletDialogFields = {
  ethAddress: string;
  contactEmail: string;
};

export const CreateAccountWithWalletDialogBody = ({ ethAddress }: Props) => {
  const { errors } = useFormikContext<CreateAccountWithWalletDialogFields>();

  return (
    <>
      <Flex flexDirection="column" gap="8px" mb="16px">
        <OnboardDialogTitleBig>Create your account</OnboardDialogTitleBig>
        <OnboardDialogDescriptionSmall>
          You'll be able to login to Realm on mobile and the web with your
          wallet.
        </OnboardDialogDescriptionSmall>
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="eth-address">
          Eth Address
        </OnboardDialogInputLabel>
        <FormField
          name="eth-address"
          type="text"
          disabled
          value={ethAddress}
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
