import { Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogInputLabel,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { FormField } from '../../onboarding';

export type FundAccountDialogFields = {
  fundingOption: number;
};

export const FundAccountDialogBody = () => {
  // const { errors } = useFormikContext<Fields>();

  return (
    <>
      <OnboardDialogTitle pb={3}>Fund your account</OnboardDialogTitle>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="eth-address">
          Deposit Address
        </OnboardDialogInputLabel>
        <FormField
          name="eth-address"
          type="text"
          placeholder="0xAC36fc83EB0B09ACd3244AD6637A8e8404724D6c"
        />
        <OnboardDialogDescription>
          This is your unique deposit address for easy hosting payments. We'll
          alert you seven days before funds run low. Recharge your address to
          maintain uninterrupted service.
        </OnboardDialogDescription>
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="eth-address">
          Funding options
        </OnboardDialogInputLabel>
      </Flex>
    </>
  );
};
