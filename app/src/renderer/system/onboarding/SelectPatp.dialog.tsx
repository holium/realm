import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { rgba } from 'polished';
import { Grid, UrbitSVG } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { HostingPlanet } from 'os/api/holium';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import {
  Avatar,
  Button,
  Box,
  Flex,
  Text,
  Spinner,
} from '@holium/design-system';

interface AvailablePlanetProps
  extends React.HtmlHTMLAttributes<HTMLDivElement> {
  patp: string;
  selected: boolean;
  theme: any;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}
type PatpOptionProps = {
  customBg?: string;
  customBorder?: string;
};
const PatpOption = styled(Button.Base)<PatpOptionProps>`
  border-radius: 6px;
  width: 180px;
  height: 40px;
  padding: 8px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 6px;
  color: rgba(var(--rlm-text-rgba));
  transition: var(--transition);
  border: 1px solid
    ${(props) => props.customBorder || 'rgba(var(--rlm-border-rgba))'};

  ${(props) =>
    props.customBg &&
    css`
      background-color: ${props.customBg};
    `}

  &:hover:not([disabled]) {
    transition: var(--transition);
    filter: brightness(0.975);
    cursor: pointer;
  }

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }
`;

const AvailablePlanet = (props: AvailablePlanetProps) => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  const Unselected = (props: any) => (
    <PatpOption onClick={props.onClick}>
      <Avatar
        sigilColor={['black', 'white']}
        size={25}
        simple
        patp={props.patp}
      />
      <Text.Custom fontSize={14} fontWeight={400} pr={2}>
        {' '}
        {props.patp}{' '}
      </Text.Custom>
    </PatpOption>
  );

  const selectedBackground = rgba(baseTheme.colors.brand.primary, 0.15);
  const selectedBorder = `${rgba(baseTheme.colors.brand.primary, 0.5)}`;
  const Selected = (props: any) => (
    <PatpOption
      customBg={selectedBackground}
      customBorder={selectedBorder}
      onClick={props.onClick}
    >
      <Avatar
        sigilColor={['black', 'white']}
        size={25}
        simple
        patp={props.patp}
      />
      <Text.Custom fontSize={14} fontWeight={400} color="accent" pr={2}>
        {' '}
        {props.patp}{' '}
      </Text.Custom>
    </PatpOption>
  );

  return props.selected ? (
    <Selected patp={props.patp} onClick={props.onClick} />
  ) : (
    <Unselected patp={props.patp} onClick={props.onClick} />
  );
};

const SelectPatpPresenter = (props: BaseDialogProps) => {
  const { theme, onboarding } = useServices();
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
        <Text.Custom
          textAlign="center"
          mt={2}
          mb={28}
          fontSize={2}
          fontWeight={400}
        >
          Choose an Urbit ID
        </Text.Custom>
        <Flex
          mt={2}
          gap={12}
          width="100%"
          minHeight={92}
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
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
          <Text.Custom
            color="intent-alert"
            fontSize={1}
            textAlign="center"
            mt={3}
          >
            Your planet was taken before you completed checkout, please select
            another one.
          </Text.Custom>
        )}
        {error && errorMessage?.length > 0 && (
          <Text.Custom
            color="intent-alert"
            fontSize={1}
            textAlign="center"
            mt={3}
          >
            {errorMessage}
          </Text.Custom>
        )}
      </Flex>
      <Box position="absolute" right={24} bottom={24} onClick={selectPlanet}>
        <Button.TextButton
          py={1}
          showOnHover
          fontWeight={500}
          disabled={
            loading || error || planets.length === 0 || selectedIndex === -1
          }
        >
          Next
        </Button.TextButton>
      </Box>
    </Grid.Column>
  );
};

export const SelectPatp = observer(SelectPatpPresenter);
