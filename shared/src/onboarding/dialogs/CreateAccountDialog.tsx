import { ChangeEvent, useRef } from 'react';
import { HoliumButton } from '@holium/design-system/os';
import { Flex, Anchor } from '@holium/design-system/general';
import { isValidEmail, useToggle } from '@holium/design-system/util';
import {
  OnboardDialogDescription,
  OnboardDialogInput,
  OnboardDialogInputLabel,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';
import { OnboardDialog } from '../components/OnboardDialog';
import { TermsModal } from '../components/TermsModal';
import { TermsDisclaimer } from '../components/TermsDisclaimer';

type Props = {
  // Terms are only necessary in Realm, not on the web.
  showTerms?: boolean;
  onAlreadyHaveAccount: () => void;
  onNext: (email: string, password: string) => Promise<boolean>;
};

export const CreateAccountDialog = ({
  showTerms = false,
  onAlreadyHaveAccount,
  onNext,
}: Props) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const terms = useToggle(false);
  const emailError = useToggle(false);
  const confirmPasswordError = useToggle(false);

  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    emailError.setToggle(!isValidEmail(email));
  };

  const onPasswordChange = () => {
    confirmPasswordError.toggleOff();
  };

  const onConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    <>
      <OnboardDialog
        icon={<HoliumButton size={100} pointer={false} />}
        body={
          <>
            <OnboardDialogTitle pb={3}>Create account</OnboardDialogTitle>
            <Flex flexDirection="column" gap={2}>
              <OnboardDialogInputLabel as="label" htmlFor="email">
                Email
              </OnboardDialogInputLabel>
              <OnboardDialogInput
                ref={emailRef}
                type="email"
                placeholder="name@email.com"
                isError={emailError.isOn}
                onChange={onEmailChange}
              />
            </Flex>
            <Flex flexDirection="column" gap={2}>
              <OnboardDialogInputLabel as="label" htmlFor="password">
                Password
              </OnboardDialogInputLabel>
              <OnboardDialogInput
                ref={passwordRef}
                type="password"
                placeholder="• • • • • • • •"
                onChange={onPasswordChange}
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
                onChange={onConfirmPasswordChange}
              />
            </Flex>
            <OnboardDialogDescription>
              Already have an account?{' '}
              <Anchor onClick={onAlreadyHaveAccount}>Log in</Anchor>.
            </OnboardDialogDescription>
          </>
        }
        footerText={showTerms && <TermsDisclaimer onClick={terms.toggleOn} />}
        onNext={handleOnNext}
      />
      <TermsModal
        isOpen={terms.isOn}
        onDismiss={terms.toggleOff}
        onAccept={terms.toggleOff}
      />
    </>
  );
};
