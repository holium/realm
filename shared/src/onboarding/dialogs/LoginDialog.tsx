import { ReactNode, useRef } from 'react';
import { Flex } from '@holium/design-system/general';
import { HoliumButton } from '@holium/design-system/os';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';
import { OnboardDialogInputLabel } from '../components/OnboardDialog.styles';
import { OnboardDialog } from '../components/OnboardDialog';
import { TermsModal } from '../components/TermsModal';
import { TermsDisclaimer } from '../components/TermsDisclaimer';

type Props = {
  prefilledEmail?: string;
  // Terms are only necessary in Realm, not on the web.
  showTerms?: boolean;
  label?: ReactNode;
  onLogin: (email: string, password: string) => Promise<boolean>;
};

export const LoginDialog = ({
  prefilledEmail = '',
  showTerms = false,
  label,
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
              <TextInput
                height="38px"
                id="login-email"
                name="login-email"
                ref={emailRef}
                defaultValue={prefilledEmail}
                type="email"
                placeholder="name@email.com"
              />
            </Flex>
            <Flex flexDirection="column" gap={2}>
              <OnboardDialogInputLabel as="label" htmlFor="password">
                Password
              </OnboardDialogInputLabel>
              <TextInput
                height="38px"
                id="login-password"
                name="login-password"
                ref={passwordRef}
                type="password"
                placeholder="• • • • • • • •"
              />
            </Flex>
            {label}
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
