import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Flex, Spinner } from 'renderer/components';
import { darken } from 'polished';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { StripePaymentView } from './StripePaymentView';

export interface StripePaymentProps extends BaseDialogProps {
  patp: string;
}

const StripePaymentPresenter = (props: StripePaymentProps) => {
  const { identity, theme } = useServices();
  const [loading, setLoading] = useState(true);
  const [stripePromise, setStripePromise] = useState<any>();
  const baseTheme = getBaseTheme(theme.currentTheme);
  const clientSecret = identity.auth.clientSecret!;
  const appearance = {
    variables: {
      fontFamily: '"Rubik", sans-serif',
      fontWeight: 500,
      colorBackground: darken(0.02, theme.currentTheme.windowColor),
      colorText: baseTheme.colors.text.primary,
      colorTextSecondary: baseTheme.colors.text.primary,
    },
  };

  useEffect(() => {
    async function getStripeKey() {
      const key = await OnboardingActions.getStripeKey();
      setStripePromise(loadStripe(key!));
      setLoading(false);
    }
    getStripeKey();
  }, []);

  return (
    <>
      {loading ? (
        <Flex
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size={4} />
        </Flex>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <StripePaymentView {...props} />
        </Elements>
      )}
    </>
  );
};

export const StripePayment = observer(StripePaymentPresenter);
