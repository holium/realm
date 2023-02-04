import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { Login } from './login';
import { Onboarding } from 'renderer/system/onboarding/Onboarding';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { useServices } from 'renderer/logic/store';
import { Splash } from './Splash';

interface LoginProps {
  hasWallpaper?: boolean;
  firstTime: boolean;
}

const AuthPresenter = ({ firstTime }: LoginProps) => {
  const { onboarding } = useServices();
  const [addShip, setAddShip] = useState(false);

  useEffect(() => {
    // This is an event that is fired when onboarding is completed
    OnboardingActions.onExit(() => {
      setAddShip(false);
    });
  }, []);

  if (!onboarding.seenSplash) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Splash />
      </Flex>
    );
  }

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      {firstTime || addShip ? (
        <Onboarding firstTime={firstTime} exit={() => setAddShip(false)} />
      ) : (
        <Login addShip={() => setAddShip(true)} />
      )}
    </Flex>
  );
};

export const Auth = observer(AuthPresenter);
