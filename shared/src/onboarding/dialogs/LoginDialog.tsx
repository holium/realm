import { ReactNode, useRef } from 'react';

import { Button, Flex, Icon } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { HoliumButton } from '@holium/design-system/os';
import { useToggle } from '@holium/design-system/util';

import { OnboardDialog } from '../components/OnboardDialog';
import { OnboardDialogInputLabel } from '../components/OnboardDialog.styles';
import { TermsModal } from '../components/TermsModal';

type Props = {
  prefilledEmail?: string;
  // Terms are only necessary in Realm, not on the web.
  footer?: ReactNode;
  label?: ReactNode;
  onBack?: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
};

export const LoginDialog = ({
  prefilledEmail = '',
  footer,
  label,
  onBack,
  onLogin,
}: Props) => {
  const terms = useToggle(false);
  const showPassword = useToggle(false);

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
              <OnboardDialogInputLabel as="label" htmlFor="login-email">
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
              <OnboardDialogInputLabel as="label" htmlFor="login-password">
                Password
              </OnboardDialogInputLabel>
              <TextInput
                height="38px"
                id="login-password"
                name="login-password"
                ref={passwordRef}
                type={showPassword.isOn ? 'text' : 'password'}
                placeholder="• • • • • • • •"
                rightAdornment={
                  <Button.IconButton
                    type="button"
                    onClick={showPassword.toggle}
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
            {label}
          </>
        }
        footer={footer}
        nextText="Login"
        onBack={onBack}
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
