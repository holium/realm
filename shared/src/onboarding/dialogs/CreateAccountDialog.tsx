import { ChangeEvent, useRef } from 'react';

import { Anchor, Button, Flex, Icon } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { HoliumButton } from '@holium/design-system/os';
import { isValidEmail, useToggle } from '@holium/design-system/util';

import { OnboardDialog } from '../components/OnboardDialog';
import {
  OnboardDialogDescription,
  OnboardDialogInputLabel,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';

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

  const showPassword = useToggle(false);
  const showConfirmPassword = useToggle(false);

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
              type={showPassword.isOn ? 'text' : 'password'}
              placeholder="• • • • • • • •"
              onChange={onChangePassword}
              rightAdornment={
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
              type={showConfirmPassword.isOn ? 'text' : 'password'}
              placeholder="• • • • • • • •"
              error={confirmPasswordError.isOn}
              onChange={onChangeConfirmPassword}
              rightAdornment={
                <Button.IconButton
                  type="button"
                  onClick={showConfirmPassword.toggle}
                >
                  <Icon
                    name={showPassword.isOn ? 'EyeOff' : 'EyeOn'}
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
      }
      onNext={handleOnNext}
    />
  );
};
