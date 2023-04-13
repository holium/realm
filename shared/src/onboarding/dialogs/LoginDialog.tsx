import { useRef } from 'react';
import { Anchor, Flex } from '@holium/design-system/general';
import { HoliumButton } from '@holium/design-system/os';
import { useToggle } from '@holium/design-system/util';
import {
  OnboardDialogDescription,
  OnboardDialogInput,
  OnboardDialogInputLabel,
} from '../components/OnboardDialog.styles';
import { OnboardDialog } from '../components/OnboardDialog';
import { TermsModal } from '../components/TermsModal';
import { TermsDisclaimer } from '../components/TermsDisclaimer';

type Props = {
  // Terms are only necessary in Realm, not on the web.
  showTerms?: boolean;
  onNoAccount: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
};

export const LoginDialog = ({
  showTerms = false,
  onNoAccount,
  onLogin,
}: Props) => {
  const terms = useToggle(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleOnLogin = () => {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (email && password) return onLogin(email, password);
    return Promise.resolve(false);
  };

  return (
    <>
      <OnboardDialog
        icon={<HoliumButton size={100} pointer={false} />}
        body={
          <>
            <Flex flexDirection="column" gap={2}>
              <OnboardDialogInputLabel as="label" htmlFor="email">
                Email
              </OnboardDialogInputLabel>
              <OnboardDialogInput
                ref={emailRef}
                type="email"
                placeholder="name@email.com"
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
              />
            </Flex>
            <OnboardDialogDescription>
              Don't have an account yet?{' '}
              <Anchor onClick={onNoAccount}>Sign up</Anchor>.
            </OnboardDialogDescription>
          </>
        }
        footerText={showTerms && <TermsDisclaimer onClick={terms.toggleOn} />}
        nextText="Login"
        onNext={handleOnLogin}
      />
      <TermsModal
        isOpen={terms.isOn}
        onDismiss={terms.toggleOff}
        onAccept={terms.toggleOff}
      />
    </>
  );
};
