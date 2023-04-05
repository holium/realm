import { ChangeEvent, useRef } from 'react';
import { Flex, HoliumButton, Anchor, useToggle } from '@holium/design-system';
import {
  OnboardDialogDescription,
  OnboardDialogInput,
  OnboardDialogInputLabel,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';
import { OnboardDialog } from '../components/OnboardDialog';

type Props = {
  email: string;
  onAlreadyHaveAccount: () => void;
  onClaim: (password: string) => Promise<boolean>;
};

export const ClaimTokenDialog = ({
  email,
  onAlreadyHaveAccount,
  onClaim,
}: Props) => {
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const confirmPasswordError = useToggle(false);

  const onChangePassword = () => {
    confirmPasswordError.toggleOff();
  };

  const onChangeConfirmPassword = (e: ChangeEvent<HTMLInputElement>) => {
    const password = passwordRef.current?.value;
    const confirmPassword = e.target.value;
    confirmPasswordError.setToggle(password !== confirmPassword);
  };

  const handleOnNext = () => {
    const password = passwordRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;

    if (!password || !confirmPassword || password !== confirmPassword) {
      return Promise.resolve(false);
    }

    return onClaim(password);
  };

  return (
    <OnboardDialog
      icon={<HoliumButton size={100} pointer={false} />}
      body={
        <>
          <OnboardDialogTitle>Claim your Realm invite</OnboardDialogTitle>
          <OnboardDialogDescription pb={3}>
            To get access to Realm, you will need to create an account. After
            you click Claim, you will be brought to a download page.
          </OnboardDialogDescription>
          <OnboardDialogInput value={email} disabled />
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel as="label" htmlFor="password">
              Password
            </OnboardDialogInputLabel>
            <OnboardDialogInput
              ref={passwordRef}
              type="password"
              placeholder="• • • • • • • •"
              onChange={onChangePassword}
            />
          </Flex>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel as="label" htmlFor="password">
              Confirm password
            </OnboardDialogInputLabel>
            <OnboardDialogInput
              ref={confirmPasswordRef}
              type="password"
              placeholder="• • • • • • • •"
              isError={confirmPasswordError.isOn}
              onChange={onChangeConfirmPassword}
            />
          </Flex>
          <OnboardDialogDescription>
            Already have an account?{' '}
            <Anchor onClick={onAlreadyHaveAccount}>Log in</Anchor>.
          </OnboardDialogDescription>
        </>
      }
      nextText="Claim"
      onNext={handleOnNext}
    />
  );
};
