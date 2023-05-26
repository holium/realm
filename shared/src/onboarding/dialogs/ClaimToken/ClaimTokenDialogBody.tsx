import { useFormikContext } from 'formik';

import { Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogInputLabel,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { FormField } from '../../onboarding';

type ClaimTokenFields = {
  password: string;
  confirmPassword: string;
};

type Props = {
  email: string;
};

export const ClaimTokenDialogBody = ({ email }: Props) => {
  const { errors } = useFormikContext<ClaimTokenFields>();

  return (
    <>
      <OnboardDialogTitle>Claim your Realm invite</OnboardDialogTitle>
      <OnboardDialogDescription pb={3}>
        To get access to Realm, you will need to create an account. After you
        click Claim, you will be brought to a download page.
      </OnboardDialogDescription>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="email">
          Email
        </OnboardDialogInputLabel>
        <FormField type="email" value={email} disabled />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="claim-token-password">
          Password
        </OnboardDialogInputLabel>
        <FormField
          name="password"
          type="password"
          placeholder="• • • • • • • •"
          isError={Boolean(errors.password)}
        />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel
          as="label"
          htmlFor="claim-token-confirm-password"
        >
          Confirm Password
        </OnboardDialogInputLabel>
        <FormField
          name="confirmPassword"
          type="password"
          placeholder="• • • • • • • •"
          isError={Boolean(errors.confirmPassword)}
        />
      </Flex>
    </>
  );
};
