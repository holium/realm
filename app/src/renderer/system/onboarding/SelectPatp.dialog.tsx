import React, { FC, useEffect, useState } from 'react';
import { darken } from 'polished';
// @ts-expect-error its there...
import UrbitSVG from '../../../../assets/urbit.svg';
import { Box, Sigil, Grid, Text, Flex, Spinner, TextButton } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { HostingPlanet } from 'os/api/holium';
import { theme } from 'renderer/theme'
import { transparentize } from 'polished';

interface AvailablePlanetProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  patp: string
  selected: boolean
  theme: any
  onClick: React.MouseEventHandler<HTMLDivElement>
}

const AvailablePlanet: FC<AvailablePlanetProps> = (props: AvailablePlanetProps) => {

  const background = darken(.01, props.theme.windowColor);
  const border = `1px solid ${transparentize(.9, '#000000')}`
  const Unselected = (props: any) => (
    <Box pl={2} height={40} minWidth={180} border={border} background={background} borderRadius={6} mb={12} mr={12} onClick={props.onClick}>
      <Flex height="100%" width="100%" flexDirection="row" alignItems="center" justifyContent="space-around">
        <Sigil color={['black', 'white']} size={25} simple patp={props.patp} />
        <Text fontSize={14} fontWeight={400} pr={2}> { props.patp } </Text>
      </Flex>
    </Box>
  );

  const selectedBackground = transparentize(.8, theme.light.colors.brand.primary);
  const selectedBorder = `1px solid ${transparentize(.5, theme.light.colors.brand.primary)}`;
  const Selected = (props: any) => (
    <Box pl={2} height={40} minWidth={180} border={selectedBorder} background={selectedBackground} borderRadius={6} mb={12} mr={12}  onClick={props.onClick}>
      <Flex height="100%" width="100%" flexDirection="row" alignItems="center" justifyContent="space-around">
        <Sigil color={['black', 'white']} size={25} simple patp={props.patp} />
        <Text fontSize={14} fontWeight={500} color="brand.primary" pr={2}> { props.patp } </Text>
      </Flex>
    </Box>
  )

  return props.selected
    ? <Selected patp={props.patp} onClick={props.onClick} />
    : <Unselected patp={props.patp} onClick={props.onClick} />
}

const SelectPatp: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    let [ planets, setPlanets ] = useState<HostingPlanet[]>([]);
    let [ selectedIndex, setSelectedIndex ] = useState<number>(0);
    let loading = planets.length === 0;

    useEffect(() => {
      let getPlanets = async () => {
        let result = await OnboardingActions.getAvailablePlanets();
        setPlanets(result);
      };

      getPlanets();
    }, []);

    function selectPlanet() {
      let selectedPlanet = planets[selectedIndex];
      OnboardingActions.selectPlanet(selectedPlanet);
      props.onNext && props.onNext();
    };

    return (
      <Grid.Column noGutter lg={12} xl={12}>
        <Flex width="100%" height="100%" flexDirection="column" alignItems="center" justifyContent="center">
          <img height={55} style={{ marginBottom: '32px' }} src={UrbitSVG} alt="urbit logo" />
          <Text textAlign="center" mb={28} fontSize={2} fontWeight={400} color="text.secondary">
            Choose an Urbit ID
          </Text>
          <Flex width="100%" flexDirection="row" justifyContent="center" flexWrap="wrap">
            { loading
              ? <Spinner size={1} />
              : planets.map((planet, index) => (
                <AvailablePlanet
                  key={index}
                  patp={planet.patp}
                  selected={index === selectedIndex}
                  theme={props.theme}
                  onClick={() => setSelectedIndex(index)}/>
              ))
            }
          </Flex>
        </Flex>
        <Box position="absolute" left={394} bottom={20} onClick={selectPlanet}>
          <TextButton>
            Next
          </TextButton>
        </Box>
      </Grid.Column>
    )
  }
);

export default SelectPatp;
