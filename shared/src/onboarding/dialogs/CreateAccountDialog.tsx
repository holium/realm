import { ChangeEvent, useRef } from 'react';
import { HoliumButton } from '@holium/design-system/os';
import { Flex, Anchor } from '@holium/design-system/general';
import { isValidEmail, useToggle } from '@holium/design-system/util';
import { TextInput } from '@holium/design-system/inputs';
import {
  OnboardDialogDescription,
  OnboardDialogInputLabel,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';
import { OnboardDialog } from '../components/OnboardDialog';

type Props = {
  onAlreadyHaveAccount: () => void;
  onNext: (email: string, password: string) => Promise<boolean>;
};

export const CreateAccountDialog = ({
  onAlreadyHaveAccount,
  onNext,
}: Props) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const emailError = useToggle(false);
  const confirmPasswordError = useToggle(false);

  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    emailError.setToggle(!isValidEmail(email));
  };

  const onChangePassword = () => {
    confirmPasswordError.toggleOff();
  };

  const onChangeConfirmPassword = (e: ChangeEvent<HTMLInputElement>) => {
    const password = passwordRef.current?.value;
    const confirmPassword = e.target.value;
    confirmPasswordError.setToggle(password !== confirmPassword);
  };

  const handleOnNext = () => {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;

    if (!email || !password || !confirmPassword) {
      return Promise.resolve(false);
    }

    if (emailError.isOn || confirmPasswordError.isOn) {
      return Promise.resolve(false);
    }

    return onNext(email, password);
  };

  return (
    <OnboardDialog
      icon={<HoliumButton size={100} pointer={false} />}
      body={
        <>
          <OnboardDialogTitle pb={3}>Create account</OnboardDialogTitle>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel as="label" htmlFor="create-account-email">
              Email
            </OnboardDialogInputLabel>
            <TextInput
              height="38px"
              id="create-account-email"
              name="create-account-email"
              ref={emailRef}
              type="email"
              placeholder="name@email.com"
              error={emailError.isOn}
              onChange={onEmailChange}
            />
          </Flex>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel
              as="label"
              htmlFor="create-account-password"
            >
              Password
            </OnboardDialogInputLabel>
            <TextInput
              height="38px"
              id="create-account-password"
              name="create-account-password"
              ref={passwordRef}
              type="password"
              placeholder="• • • • • • • •"
              onChange={onChangePassword}
            />
          </Flex>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel
              as="label"
              htmlFor="create-account-confirm-password"
            >
              Confirm Password
            </OnboardDialogInputLabel>
            <TextInput
              height="38px"
              id="create-account-confirm-password"
              name="create-account-confirm-password"
              ref={confirmPasswordRef}
              type="password"
              placeholder="• • • • • • • •"
              error={confirmPasswordError.isOn}
              onChange={onChangeConfirmPassword}
            />
          </Flex>
          <OnboardDialogDescription>
            Already have an account?{' '}
            <Anchor onClick={onAlreadyHaveAccount}>Log in</Anchor>.
          </OnboardDialogDescription>
        </>
      }
      onNext={handleOnNext}
    />
  );
};
