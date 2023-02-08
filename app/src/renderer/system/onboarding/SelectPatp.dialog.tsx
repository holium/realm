import React, { FC, useEffect, useState } from 'react';
import { darken, transparentize } from 'polished';
import {
  Box,
  Sigil,
  Grid,
  Text,
  Flex,
  Spinner,
  TextButton,
  UrbitSVG,
} from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { HostingPlanet } from 'os/api/holium';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';

interface AvailablePlanetProps
  extends React.HtmlHTMLAttributes<HTMLDivElement> {
  patp: string;
  selected: boolean;
  theme: any;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

const AvailablePlanet: FC<AvailablePlanetProps> = (
  props: AvailablePlanetProps
) => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);
  const background = darken(0.01, props.theme.windowColor);
  const border = `1px solid ${transparentize(
    0.9,
    theme.currentTheme.mode === 'light' ? '#000000' : '#ffffff'
  )}`;
  const Unselected = (props: any) => (
    <Box
      pl={2}
      height={40}
      minWidth={180}
      border={border}
      background={background}
      borderRadius={6}
      mb={12}
      mr={12}
      onClick={props.onClick}
    >
      <Flex
        height="100%"
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-around"
      >
        <Sigil color={['black', 'white']} size={25} simple patp={props.patp} />
        <Text fontSize={14} fontWeight={400} pr={2}>
          {' '}
          {props.patp}{' '}
        </Text>
      </Flex>
    </Box>
  );

  const selectedBackground = transparentize(
    0.8,
    baseTheme.colors.brand.primary
  );
  const selectedBorder = `1px solid ${transparentize(
    0.5,
    baseTheme.colors.brand.primary
  )}`;
  const Selected = (props: any) => (
    <Box
      pl={2}
      height={40}
      minWidth={180}
      border={selectedBorder}
      background={selectedBackground}
      borderRadius={6}
      mb={12}
      mr={12}
      onClick={props.onClick}
    >
      <Flex
        height="100%"
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-around"
      >
        <Sigil color={['black', 'white']} size={25} simple patp={props.patp} />
        <Text fontSize={14} fontWeight={400} color="brand.primary" pr={2}>
          {' '}
          {props.patp}{' '}
        </Text>
      </Flex>
    </Box>
  );

  return props.selected ? (
    <Selected patp={props.patp} onClick={props.onClick} />
  ) : (
    <Unselected patp={props.patp} onClick={props.onClick} />
  );
};

const SelectPatp: FC<BaseDialogProps> = observer((props: BaseDialogProps) => {
  const { theme, onboarding } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);
  const [planets, setPlanets] = useState<HostingPlanet[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getPlanets = async () => {
      setLoading(true);
      OnboardingActions.getAvailablePlanets()
        .then((result) => {
          setPlanets(result);
          if (result.length === 0) {
            setError(true);
            setErrorMessage(
              `no ships available, contact hosting@holium.com for support`
            );
          }
        })
        .catch((e) => {
          console.log(e);
          setError(true);
          setErrorMessage(
            `an error occurred retrieving available planets. contact hosting@holium.com for support`
          );
        })
        .finally(() => setLoading(false));
    };

    getPlanets();
  }, []);

  useEffect(() => {
    // Make planets tabable
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        const previousIndex = selectedIndex - 1;
        const previousPlanet = planets[previousIndex];
        if (previousPlanet) {
          setSelectedIndex(previousIndex);
        } else {
          setSelectedIndex(planets.length - 1);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const nextIndex = selectedIndex + 1;
        const nextPlanet = planets[nextIndex];
        if (nextPlanet) {
          setSelectedIndex(nextIndex);
        } else {
          setSelectedIndex(0);
        }
      } else if (e.key === 'Enter') {
        selectPlanet();
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [selectedIndex, planets]);

  function selectPlanet() {
    const selectedPlanet = planets[selectedIndex];
    OnboardingActions.selectPlanet(selectedPlanet);
    props.onNext && props.onNext();
  }

  return (
    <Grid.Column noGutter lg={12} xl={12}>
      <Flex
        width="100%"
        height="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <UrbitSVG
          mode={theme.currentTheme.mode as 'light' | 'dark'}
          size={55}
        />
        <Text
          textAlign="center"
          mt={2}
          mb={28}
          fontSize={2}
          fontWeight={400}
          color="text.secondary"
        >
          Choose an Urbit ID
        </Text>
        <Flex
          width="100%"
          flexDirection="row"
          justifyContent="center"
          flexWrap="wrap"
        >
          {loading ? (
            <Spinner size={1} />
          ) : (
            planets.map((planet, index) => (
              <AvailablePlanet
                key={index}
                patp={planet.patp}
                selected={index === selectedIndex}
                tabIndex={index}
                theme={props.theme}
                onClick={() => setSelectedIndex(index)}
              />
            ))
          )}
        </Flex>
        {onboarding.planetWasTaken && (
          <Text
            color={baseTheme.colors.text.error}
            fontSize={1}
            textAlign="center"
            mt={3}
          >
            Your planet was taken before you completed checkout, please select
            another one.
          </Text>
        )}
        {error && errorMessage?.length > 0 && (
          <Text
            color={baseTheme.colors.text.error}
            fontSize={1}
            textAlign="center"
            mt={3}
          >
            No available planets found. Please contact Realm support.
          </Text>
        )}
      </Flex>
      <Box position="absolute" left={394} bottom={20} onClick={selectPlanet}>
        <TextButton
          disabled={
            !(!loading && !error && planets.length > 0 && selectedIndex >= 0)
          }
        >
          Next
        </TextButton>
      </Box>
    </Grid.Column>
  );
});

export default SelectPatp;
