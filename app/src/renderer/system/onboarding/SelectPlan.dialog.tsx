import { FC, useEffect, useState } from 'react';
import { darken, transparentize } from 'polished';
import { Box, Text, Flex, Icons, Button } from 'renderer/components';
import { theme } from 'renderer/theme';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { Avatar } from '@holium/design-system';

export interface SelectPlanProps extends BaseDialogProps {
  patp: string;
}

const SelectPlan: FC<SelectPlanProps> = observer((props: SelectPlanProps) => {
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const { onboarding } = useServices();
  const planet = onboarding.planet!;

  const panelBackground = darken(0.02, props.theme!.windowColor);
  const panelBorder = `2px solid ${transparentize(0.9, '#000000')}`;
  const bulletIconColor = transparentize(0.1, props.theme!.iconColor);
  const selectedBackground = transparentize(
    0.8,
    theme.light.colors.brand.primary
  );
  const selectedBorder = `2px solid ${transparentize(
    0.3,
    theme.light.colors.brand.primary
  )}`;

  async function subscribe() {
    setSubscribeLoading(true);
    await OnboardingActions.prepareCheckout(billingPeriod);
    setSubscribeLoading(false);
    props.onNext && props.onNext();
  }

  useEffect(() => {
    // Make billingperiod tabable
    const handleKeydown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === 'Tab') {
        if (billingPeriod === 'monthly') {
          setBillingPeriod('annual');
        } else {
          setBillingPeriod('monthly');
        }
      } else if (e.key === 'Enter') {
        subscribe();
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [billingPeriod]);

  const PlanetPreview = () => (
    <Flex flexDirection="column" justifyContent="center" alignItems="center">
      <Box height={48} width={48} mb={12}>
        <Avatar
          sigilColor={['black', 'white']}
          simple={false}
          size={48}
          patp={planet.patp}
        />
      </Box>
      <Text> {planet.patp} </Text>
    </Flex>
  );

  const HostingFeature = (props: any) => (
    <Flex pb={10} flexDirection="row">
      <Icons mr={14} color={bulletIconColor} name="CheckCircle" />
      <Text variant="body">{props.children}</Text>
    </Flex>
  );

  const SubscriptionTier = (props: any) => (
    <Box
      background={props.selected ? selectedBackground : panelBackground}
      border={props.selected ? selectedBorder : panelBorder}
      borderRadius={6}
      padding={3}
      display="flex"
      width="100%"
      mt={props.mt}
      onClick={props.onClick}
    >
      <Flex width="100%" flexDirection="column" alignItems="center">
        <Flex width="100%" justifyContent="space-between">
          <Text variant="h6" mb={2}>
            {props.title}
          </Text>
          <Text textAlign="center" variant="h5">
            {props.price}
          </Text>
        </Flex>
        <Box mt={1}>
          <Text variant="body" color={bulletIconColor}>
            {props.children}
          </Text>
        </Box>
      </Flex>
    </Box>
  );

  return (
    <>
      <Flex width="100%" height="100%" flexDirection="row">
        <Box
          flex={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <PlanetPreview />
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
        </Box>
        <Flex flex={3} px={50} flexDirection="column" justifyContent="center">
          <SubscriptionTier
            title="Monthly subscription"
            price={`$15/month`}
            selected={billingPeriod === 'monthly'}
            tabable={true}
            onClick={() => setBillingPeriod('monthly')}
          >
            Pay monthly and own your planet after you first three payments.
          </SubscriptionTier>
          <SubscriptionTier
            mt={56}
            title="Annual subscription"
            price={`$150/year`}
            selected={billingPeriod === 'annual'}
            onClick={() => setBillingPeriod('annual')}
          >
            Pay annually and own your planet immediately upon purchase.
          </SubscriptionTier>
        </Flex>
      </Flex>
      <Button
        position="absolute"
        top={495}
        left={640}
        isLoading={subscribeLoading}
        onClick={subscribe}
      >
        Subscribe
      </Button>
    </>
  );
});

export default SelectPlan;
