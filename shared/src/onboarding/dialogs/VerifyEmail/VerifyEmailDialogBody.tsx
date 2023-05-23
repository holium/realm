import { useState } from 'react';

import { Anchor } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { FormField } from '../../onboarding';

type Props = {
  onResend: () => void;
};

export const VerifyEmailDialogBody = ({ onResend }: Props) => {
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

  return (
    <>
      <OnboardDialogTitle>Verify email</OnboardDialogTitle>
      <OnboardDialogDescription>
        You will receive a code via email to verify your account.
      </OnboardDialogDescription>
      <FormField
        name="verificationcode"
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
            Haven't received one? <Anchor onClick={handleResend}>Resend</Anchor>
            .
          </>
        )}
      </OnboardDialogDescription>
    </>
  );
};
