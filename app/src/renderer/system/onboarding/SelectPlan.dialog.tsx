import React, { FC, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { darken } from 'polished';
// @ts-expect-error its there...
import UrbitSVG from '../../../../assets/urbit.svg';
import { Box, Sigil, Grid, Text, Flex, Icons, Button } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { HostingPlanet } from 'os/api/holium';

interface SelectPlanProps extends BaseDialogProps {
  patp: string
}

const SelectPlan: FC<SelectPlanProps> = observer(
  (props: SelectPlanProps) => {
    let { onboarding } = useServices();
    let planet = onboarding.planet!;

    // TODO fix hardcoded colors once shell.theme is available pre-login
    return (
      <Grid.Column noGutter lg={12} xl={12}>
        <Flex width="100%" height="100%" flexDirection="column" alignItems="center" justifyContent="space-around">
          <Flex flexDirection="column" justifyContent="center" alignItems="center">
            <Box height={48} width={48} mb={12}>
              <Sigil color={['black', 'white']} simple={false} size={48} patp={planet.patp!} />
            </Box>
            <Text> { planet.patp! } </Text>
          </Flex>
          <Box mb={2} height={290} width={275} background={darken(.01, '#f0ecec')} border="1px solid rgba(0, 0, 0, 0.1)" borderRadius={18}>
            <Flex pt={20} flexDirection="column" alignItems="center" justifyContent="space-between">
              <Flex flexDirection="column" justifyContent="center">
                <Text variant="h5" mb={2}>Planet hosting</Text>
                <Text textAlign="center" fontSize={14} color="rgba(51, 51, 51, 0.5)">$12/month</Text>
              </Flex>
              <Flex pt={24} pl={20} mb={18} width={256} flexDirection="column" alignItems="left" justifyContent="center">
                <Flex pb={10} flexDirection="row">
                  <Icons mr={14} color="rgba(51, 51, 51, 0.5)" name="CheckCircle" />
                  <Text variant="body"> Backups </Text>
                </Flex>
                <Flex pb={10} flexDirection="row">
                  <Icons mr={14} color="rgba(51, 51, 51, 0.5)" name="CheckCircle" />
                  <Text variant="body"> Automatic OTA updates </Text>
                </Flex>
                <Flex pb={10} flexDirection="row">
                  <Icons mr={14} color="rgba(51, 51, 51, 0.5)" name="CheckCircle" />
                  <Text variant="body"> Customer support </Text>
                </Flex>
                <Flex pb={10} mr={4} flexDirection="row">
                  <Icons mr={14} color="rgba(51, 51, 51, 0.5)" name="CheckCircle" />
                  <Text variant="body"> After 24 months, you can keep your assigned planet </Text>
                </Flex>
              </Flex>
              <Flex px={20} width="100%" flexDirection="row" justifyContent="space-between">
                <Button variant="base"> Invite code </Button>
                <Button> Subscribe </Button>
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </Grid.Column>
    )
  }
);

export default SelectPlan;
