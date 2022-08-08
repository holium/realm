import { FC, useState } from 'react';
import { darken } from 'polished';
// @ts-expect-error its there...
import UrbitSVG from '../../../../assets/urbit.svg';
import { Box, Sigil, Grid, Text, Flex, Icons, Button } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { OnboardingStep } from 'os/services/onboarding/onboarding.model';
import { transparentize } from 'polished'

interface SelectPlanProps extends BaseDialogProps {
  patp: string
}

const SelectPlan: FC<SelectPlanProps> = observer(
  (props: SelectPlanProps) => {
    let [ subscribeLoading, setSubscribeLoading ] = useState(false)
    let { onboarding } = useServices();
    let planet = onboarding.planet!;

    const panelBackground = darken(.02, props.theme.windowColor);
    const panelBorder = `1px solid ${transparentize(.9, '#000000')}`;

    async function subscribe() {
      setSubscribeLoading(true)
      await OnboardingActions.prepareCheckout()
      setSubscribeLoading(false)
      console.log('done loading, on nextttt')
      props.onNext && props.onNext();
    }

    async function previous() {
      OnboardingActions.setStep(OnboardingStep.ACCESS_CODE);
    }

    return (
      <Grid.Column noGutter lg={12} xl={12}>
        <Flex width="100%" height="100%" flexDirection="column" alignItems="center" justifyContent="space-around">
          <Flex flexDirection="column" justifyContent="center" alignItems="center">
            <Box height={48} width={48} mb={12}>
              <Sigil color={['black', 'white']} simple={false} size={48} patp={planet.patp!} />
            </Box>
            <Text> { planet.patp! } </Text>
          </Flex>
          <Box mb={2} height={290} width={275} background={panelBackground} border={panelBorder} borderRadius={18}>
            <Flex pt={20} flexDirection="column" alignItems="center" justifyContent="space-between">
              <Flex flexDirection="column" justifyContent="center">
                <Text variant="h5" mb={2}>Planet hosting</Text>
                <Text textAlign="center" fontSize={14} color={transparentize(.5, props.theme.iconColor)}>$12/month</Text>
              </Flex>
              <Flex pt={24} pl={20} mb={18} width={256} flexDirection="column" alignItems="left" justifyContent="center">
                <Flex pb={10} flexDirection="row">
                  <Icons mr={14} color={transparentize(.5, props.theme.iconColor)} name="CheckCircle" />
                  <Text variant="body"> Backups </Text>
                </Flex>
                <Flex pb={10} flexDirection="row">
                  <Icons mr={14} color={transparentize(.5, props.theme.iconColor)} name="CheckCircle" />
                  <Text variant="body"> Automatic OTA updates </Text>
                </Flex>
                <Flex pb={10} flexDirection="row">
                  <Icons mr={14} color={transparentize(.5, props.theme.iconColor)} name="CheckCircle" />
                  <Text variant="body"> Customer support </Text>
                </Flex>
                <Flex pb={10} mr={4} flexDirection="row">
                  <Icons mr={14} color={transparentize(.5, props.theme.iconColor)} name="CheckCircle" />
                  <Text variant="body">2GB block storage included</Text>
                </Flex>
              </Flex>
              <Flex px={20} width="100%" flexDirection="row" justifyContent="space-between">
                <Button
                  variant="custom"
                  background={darken(.04, panelBackground)}
                  border={panelBorder} onClick={previous}
                  color={props.theme.textColor}>
                    Invite code
                </Button>
                <Button isLoading={subscribeLoading} onClick={subscribe}> Subscribe </Button>
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </Grid.Column>
    )
  }
);

export default SelectPlan;
