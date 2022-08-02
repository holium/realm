import React, { FC, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { darken } from 'polished';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
// @ts-expect-error its there...
import UrbitSVG from '../../../../assets/urbit.svg';
import { Box, Sigil, Grid, Text, Flex, Icons, Button, ActionButton } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { AccessCode, HostingPlanet } from 'os/api/holium';

interface StripePaymentProps extends BaseDialogProps {
  patp: string
}

const appearance = {
  variables: {
    fontFamily: '"Rubik", sans-serif',
    fontWeight: 500
  }
}

const stripePromise = loadStripe("pk_test_51LIclKGa9esKD8bTeH2WlTZ8ZyJiwXfc5M6e1RdV01zH8G5x3kq0EZbN9Zuhtkm6WBXslp6MQlErpP8lkKtwSMqf00NomWTPxM");
const StripePayment: FC<StripePaymentProps> = (props: StripePaymentProps) => {
  let { identity } = useServices();
  let clientSecret = identity.auth.clientSecret!;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <MainComponent {...props} />
    </Elements>
  )
}

const MainComponent: FC<StripePaymentProps> = observer(
  (props: StripePaymentProps) => {
    let stripe = useStripe();
    const elements = useElements();
    let { onboarding } = useServices();

    let [ message, setMessage ] = useState({ type: 'notification', text: '' });
    let [ loading, setLoading ] = useState(false);

    async function completeCheckout() {
      try {
        await OnboardingActions.completeCheckout();
        setLoading(false);
        props.onNext && props.onNext();
      } catch (reason) {
        console.error(reason);
        setLoading(false);
        setMessage({ type: 'error', text: 'There was an error completing your checkout.' });
      }
    }

    async function handleSubmit (e: any) {
      e.preventDefault();

      if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
      }

      setLoading(true);

      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: 'https://holium.network'
        },
        redirect: 'if_required'
      });

      if (paymentIntent) {
        if (paymentIntent?.status === 'succeeded') {
          setMessage({ type: 'notification', text: 'Payment succeeded. Completing your purchase...'});
          await completeCheckout();
        } else {
          setMessage({ type: 'error', text: 'Your payment was not successful, please try again.'})
        }
      }

      setLoading(false);
    };


    return (
      <Flex width="100%" height="100%" flexDirection="row">
          <Box flex={2} display="flex" flexDirection="column">
              <Flex flex={2} flexDirection="column" justifyContent="center" alignItems="center">
                <Flex flex={2} flexDirection="column" alignItems="center" justifyContent="center">
                  <Sigil color={['black', 'white']} simple={false} size={48} patp={onboarding.planet!.patp!} />
                  <Box>
                    <Text mt={3} flex={1}> { onboarding.planet!.patp } </Text>
                  </Box>
                </Flex>
                <Flex flex={1} width="100%" flexDirection="column" alignItems="center" justifyContent="center" hidden={!onboarding.accessCode} >
                    <Text variant="body" color="text.tertiary">
                      Applying access code:
                    </Text>
                    <Flex mt={18} flexDirection="row" alignItems="center" justifyContent="center">
                      <img height={28} style={{ borderRadius: 6 }} src={onboarding?.accessCode?.image as string} />
                      <Text ml={3} variant="body">{onboarding?.accessCode?.title}</Text>
                    </Flex>
                </Flex>
              </Flex>
              <Flex mt={56} width="100%" flex={1} justifyContent="center" hidden={message.text === ''}>
                <Text textAlign="center" variant="body" color={message.type === 'error' ? 'text.error' : undefined }>{message.text}</Text>
              </Flex>
          </Box>
          <Flex flex={3} alignItems="center" justifyContent="center">
            <form onSubmit={handleSubmit}>
              <Flex flexDirection="column">
                <Flex flex={6}>
                  <PaymentElement />
                </Flex>
                <Flex mt={36} flex={1} align-items="flex-end" justifyContent="flex-end">
                  <Button isLoading={loading} disabled={loading || !stripe || !elements} id="submit">
                    Purchase
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Flex>
      </Flex>
    )
  }
);

export default StripePayment;
