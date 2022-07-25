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
import { HostingPlanet } from 'os/api/holium';

interface StripePaymentProps extends BaseDialogProps {
  patp: string
}

const stripePromise = loadStripe("pk_test_51LIclKGa9esKD8bTeH2WlTZ8ZyJiwXfc5M6e1RdV01zH8G5x3kq0EZbN9Zuhtkm6WBXslp6MQlErpP8lkKtwSMqf00NomWTPxM");
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Rubik", sans-serif',
      fontWeight: 300,
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
      backgroundColor: "blue"
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const StripePayment: FC<StripePaymentProps> = (props: StripePaymentProps) => {
  let { identity } = useServices();
  let clientSecret = identity.auth.clientSecret!;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <MainComponent {...props} />
    </Elements>
  )
}

const MainComponent: FC<StripePaymentProps> = observer(
  (props: StripePaymentProps) => {
    let stripe = useStripe();
    const elements = useElements();
    let { onboarding, identity } = useServices();

    let [ message, setMessage ] = useState('Subscribe for $12/mo by clicking the purchase button.');
    let [ loading, setLoading ] = useState(false);


    let planet = onboarding.planet!;
    let clientSecret = identity.auth.clientSecret!;

    useEffect(() => {
      if (!stripe) {
        return;
      }

      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case "succeeded":
            setMessage("Payment succeeded!");
            setTimeout(() => {
              props.onNext && props.onNext();
            }, 2000)
            break;
          case "processing":
            setMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setMessage("Your payment was not successful, please try again.");
            break;
          default:
            setMessage("Something went wrong.");
            break;
        }
      });
    }, [stripe]);

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
        switch (paymentIntent?.status) {
          case "succeeded":
            setMessage("Payment succeeded!");
            setTimeout(() => {
              props.onNext && props.onNext();
            }, 2000)
            break;
          case "processing":
            setMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setMessage("Your payment was not successful, please try again.");
            break;
          default:
            setMessage("Something went wrong.");
            break;
        }
      }

      if (error && error.message) {
        setMessage('there was an error, sad')
      }

      setLoading(false);
    };


    // TODO fix hardcoded colors once shell.theme is available pre-login
    return (
      <Grid.Row expand noGutter>
        <Grid.Column>
          <Flex width="100%" height="100%" flexDirection="column" justifyContent="center">
            <Flex flexDirection="column" justifyContent="center" alignItems="center">
              <Box height={48} width={48} mb={12}>
                <Sigil color={['black', 'white']} simple={false} size={48} patp={planet.patp!} />
              </Box>
              <Text> { planet.patp! } </Text>
            </Flex>
            <Box height={300} hidden={message === ''}>
              {message}
            </Box>
          </Flex>
        </Grid.Column>
        <Grid.Column>
          <form id="payment-form" onSubmit={handleSubmit}>
            <label>
              <PaymentElement />
            </label>
            <Button isLoading={loading} disabled={loading || !stripe || !elements} id="submit">
              Purchase
            </Button>
          </form>
        </Grid.Column>
      </Grid.Row>
    )
  }
);

export default StripePayment;

// return (
//   <Grid.Column noGutter lg={12} xl={12}>
//     <Flex width="100%" height="100%" flexDirection="column" alignItems="center" justifyContent="space-around">
//       <Flex flexDirection="column" justifyContent="center" alignItems="center">
//         <Box height={48} width={48} mb={12}>
//           <Sigil color={['black', 'white']} simple={false} size={48} patp={planet.patp!} />
//         </Box>
//         <Text> { planet.patp! } </Text>
//       </Flex>
//       <Box hidden={message === ''}>
//         {message}
//       </Box>
//       <form id="payment-form" onSubmit={handleSubmit}>
//         <label>
//           <PaymentElement />
//         </label>
//         <Button isLoading={loading} disabled={loading || !stripe || !elements} id="submit">
//           Purchase
//         </Button>
//       </form>
//     </Flex>
//   </Grid.Column>
// )
// }
