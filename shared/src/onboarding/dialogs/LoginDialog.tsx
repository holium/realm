import { useRef } from 'react';
import { Anchor, Flex } from '@holium/design-system/general';
import { HoliumButton } from '@holium/design-system/os';

import { OnboardDialog } from '../components/OnboardDialog';
import {
  OnboardDialogDescription,
  OnboardDialogInput,
  OnboardDialogInputLabel,
} from '../components/OnboardDialog.styles';

type Props = {
  prefilledEmail: string;
  onNoAccount: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
};

export const LoginDialog = ({
  prefilledEmail,
  onNoAccount,
  onLogin,
}: Props) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleOnLogin = () => {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (email && password) return onLogin(email, password);
    return Promise.resolve(false);
  };

  return (
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
              defaultValue={prefilledEmail}
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
      nextText="Login"
      onNext={handleOnLogin}
    />
  );
};
