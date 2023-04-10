import { useRef, useState } from 'react';
import { Anchor, Input, Icon } from '@holium/design-system';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../components/OnboardDialog.styles';
import { OnboardDialog } from '../components/OnboardDialog';

type Props = {
  onResend: () => void;
  onBack: () => void;
  onNext: (code: string) => Promise<boolean>;
};

export const VerifyEmailDialog = ({ onResend, onBack, onNext }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResend = () => {
    onResend();

    // Start counting down the cooldown.
    setResendCooldown(60);

    const interval = setInterval(() => {
      setResendCooldown((cooldown) => {
        if (cooldown === 0) {
          clearInterval(interval);
          return cooldown;
        }

        return cooldown - 1;
      });
    }, 1000);
  };

  const handleOnNext = () => {
    if (!inputRef.current?.value) return Promise.resolve(false);

    return onNext(inputRef.current.value);
  };

  return (
    <OnboardDialog
      icon={<Icon name="AtSign" fill="accent" width="86px" height="86px" />}
      body={
        <>
          <OnboardDialogTitle>Verify email</OnboardDialogTitle>
          <OnboardDialogDescription>
            You will receive a code via email to verify your account.
          </OnboardDialogDescription>
          <Input
            ref={inputRef}
            type="text"
            placeholder="ayz...abc"
            style={{
              flex: 1,
              padding: '13px',
              textAlign: 'center',
              fontSize: 20,
            }}
          />
          <OnboardDialogDescription>
            {resendCooldown > 0 ? (
              `Please wait ${resendCooldown} seconds to resend.`
            ) : (
              <>
                Haven't received one?{' '}
                <Anchor onClick={handleResend}>Resend</Anchor>.
              </>
            )}
          </OnboardDialogDescription>
        </>
      }
      onBack={onBack}
      onNext={handleOnNext}
    />
  );
};
