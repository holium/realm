import { useFormikContext } from 'formik';

import { Anchor, Button, Flex, Icon } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import {
  OnboardDialogDescription,
  OnboardDialogInputLabel,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { FormField } from '../../onboarding';

type CreateAccountFields = {
  email: string;
  password: string;
  confirmPassword: string;
};

type Props = {
  onAlreadyHaveAccount: () => void;
};

export const CreateAccountDialogBody = ({ onAlreadyHaveAccount }: Props) => {
  const { errors } = useFormikContext<CreateAccountFields>();
  const showPassword = useToggle(false);
  const showConfirmPassword = useToggle(false);

  return (
    <>
      <OnboardDialogTitle pb={3}>Create account</OnboardDialogTitle>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="email">
          Email
        </OnboardDialogInputLabel>
        <FormField
          name="email"
          type="email"
          placeholder="name@email.com"
          isError={Boolean(errors?.email)}
        />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="password">
          Password
        </OnboardDialogInputLabel>
        <FormField
          name="password"
          type={showPassword.isOn ? 'text' : 'password'}
          placeholder="••••••••"
          isError={Boolean(errors?.password)}
          rightIcon={
            <Button.IconButton type="button" onClick={showPassword.toggle}>
              <Icon
                name={showPassword.isOn ? 'EyeOff' : 'EyeOn'}
                opacity={0.5}
                size={18}
              />
            </Button.IconButton>
          }
        />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="confirm-password">
          Confirm Password
        </OnboardDialogInputLabel>
        <FormField
          height="38px"
          name="confirmPassword"
          type={showConfirmPassword.isOn ? 'text' : 'password'}
          isError={Boolean(errors?.confirmPassword)}
          placeholder="••••••••"
          rightIcon={
            <Button.IconButton
              type="button"
              onClick={showConfirmPassword.toggle}
            >
              <Icon
                name={showConfirmPassword.isOn ? 'EyeOff' : 'EyeOn'}
                opacity={0.5}
                size={18}
              />
            </Button.IconButton>
          }
        />
      </Flex>
      <OnboardDialogDescription>
        Already have an account?{' '}
        <Anchor onClick={onAlreadyHaveAccount}>Log in</Anchor>.
      </OnboardDialogDescription>
    </>
  );
};
