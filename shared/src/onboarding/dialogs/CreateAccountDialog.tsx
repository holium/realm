import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { Anchor, Button, Flex, Icon } from '@holium/design-system/general';
import { HoliumButton } from '@holium/design-system/os';
import { useToggle } from '@holium/design-system/util';

import { OnboardDialog } from '../components/OnboardDialog';
import {
  OnboardDialogDescription,
  OnboardDialogInputLabel,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';
import { FormField } from '../onboarding';

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
}: Props) => {
  const showPassword = useToggle(false);
  const showConfirmPassword = useToggle(false);

  return (
    <OnboardDialog
      initialValues={{
        email: prefilledEmail,
        password: undefined,
        confirmPassword: undefined,
      }}
      validationSchema={CreateAccountSchema}
      icon={<HoliumButton size={100} pointer={false} />}
      body={(errors) => (
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
      )}
      onNext={onNext}
    />
  );
};
