import { useEffect, useState } from 'react';
import { Avatar } from '@holium/design-system';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { observer } from 'mobx-react';
import { transparentize } from 'polished';
import { Box, Button, Flex, Icons, Text } from 'renderer/components';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { useServices } from 'renderer/logic/store';

import { StripePaymentProps } from './StripePayment.dialog';

const StripePaymentViewPresenter = (props: StripePaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { onboarding, theme } = useServices();

  const [message, setMessage] = useState({ type: 'notification', text: '' });
  const [loading, setLoading] = useState(false);
  const [hideButton, setHideButton] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setHideButton(false);
    }, 2000);
  }, []);

  const bulletIconColor = transparentize(0.1, theme.currentTheme.iconColor);
  const HostingFeature = (props: any) => (
    <Flex pb={10} flexDirection="row">
      <Icons mr={14} color={bulletIconColor} name="CheckCircle" />
      <Text variant="body">{props.children}</Text>
    </Flex>
  );

  async function completeCheckout() {
    try {
      await OnboardingActions.completeCheckout();
      setLoading(false);
      props.onNext && props.onNext();
    } catch (reason) {
      console.error(reason);
      setLoading(false);
      setMessage({
        type: 'error',
        text: 'There was an error verifying your payment in our system. Please contact support@holium.com.',
      });
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    await OnboardingActions.confirmPlanetStillAvailable();

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: 'https://holium.network',
        },
        redirect: 'if_required',
      });

      if (paymentIntent) {
        if (paymentIntent?.status === 'succeeded') {
          await completeCheckout();
        } else {
          setMessage({
            type: 'error',
            text: 'Your payment was not successful, please try again.',
          });
        }
      } else {
        setMessage({
          type: 'error',
          text:
            error.message ||
            'Your payment was not successful, please try again!',
        });
      }
    } catch (e) {
      console.log(`submitting stripe payment threw:`, e);
      setMessage({
        type: 'error',
        text: 'Something went wrong processing your payment, please try again.',
      });
    }

    setLoading(false);
  }

  if (!onboarding.planet) return null;

  return (
    <Flex width="100%" height="100%" flexDirection="row">
      <Box flex={2} display="flex" flexDirection="column">
        <Flex
          flex={2}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Flex
            pt={64}
            flex={2}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Avatar
              sigilColor={['black', 'white']}
              simple={false}
              size={48}
              patp={onboarding.planet.patp ?? ''}
            />
            <Box>
              <Text mt={3} flex={1}>
                {' '}
                {onboarding.planet.patp}{' '}
              </Text>
            </Box>
          </Flex>
          {onboarding?.accessCode && (
            <Flex
              flex={1}
              width="100%"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              hidden={!onboarding.accessCode}
            >
              <Text variant="body" color="text.tertiary">
                Applying access code:
              </Text>
              <Flex
                mt={18}
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
              >
                <img
                  alt="access code"
                  height={28}
                  style={{ borderRadius: 6 }}
                  src={onboarding?.accessCode?.image as string}
                />
                <Text ml={3} variant="body">
                  {onboarding?.accessCode?.title}
                </Text>
              </Flex>
            </Flex>
          )}
          {!onboarding?.accessCode && (
            <Flex
              pt={72}
              flexDirection="column"
              alignItems="left"
              justifyContent="center"
            >
              <HostingFeature> Backups </HostingFeature>
              <HostingFeature> Automatic OTA updates </HostingFeature>
              <HostingFeature> Customer support </HostingFeature>
              <HostingFeature> 2GB block storage included </HostingFeature>
            </Flex>
          )}
        </Flex>
        <Flex
          mt={8}
          width="100%"
          flex={1}
          justifyContent="center"
          hidden={message.text === ''}
        >
          <Text
            textAlign="center"
            variant="body"
            color={message.type === 'error' ? 'text.error' : undefined}
          >
            {message.text}
          </Text>
        </Flex>
      </Box>
      <Flex flex={3} alignItems="center" justifyContent="center" mt={8}>
        <form onSubmit={handleSubmit}>
          <Flex flexDirection="column">
            <Flex flex={6}>
              <PaymentElement />
            </Flex>
            <Flex
              mt={36}
              flex={1}
              align-items="flex-end"
              justifyContent="flex-end"
            >
              <Box hidden={hideButton}>
                <Button
                  isLoading={loading}
                  disabled={loading || !stripe || !elements}
                  id="submit"
                >
                  Purchase
                </Button>
              </Box>
            </Flex>
          </Flex>
        </form>
      </Flex>
    </Flex>
  );
};

export const StripePaymentView = observer(StripePaymentViewPresenter);
