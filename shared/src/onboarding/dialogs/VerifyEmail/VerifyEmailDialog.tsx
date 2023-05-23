import { useState } from 'react';
import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { Anchor, Icon } from '@holium/design-system/general';

import { OnboardDialog } from '../../components/OnboardDialog';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { FormField } from '../../onboarding';

const VerifyEmailSchema = Yup.object().shape({
  verificationcode: Yup.string().required('Required'),
});

type Props = {
  onResend: () => void;
  onBack: () => void;
  onNext: (values: FormikValues) => Promise<boolean>;
};

export const VerifyEmailDialog = ({ onResend, onBack, onNext }: Props) => {
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
    <OnboardDialog
      validationSchema={VerifyEmailSchema}
      icon={<Icon name="AtSign" fill="accent" width="86px" height="86px" />}
      body={() => (
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
                Haven't received one?{' '}
                <Anchor onClick={handleResend}>Resend</Anchor>.
              </>
            )}
          </OnboardDialogDescription>
        </>
      )}
      onBack={onBack}
      onNext={onNext}
    />
  );
};
