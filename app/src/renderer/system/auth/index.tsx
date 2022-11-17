import { FC, useEffect, useState } from 'react';
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

export const Auth: FC<LoginProps> = observer((props: LoginProps) => {
  const { hasWallpaper, firstTime } = props;
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
        <Login hasWallpaper={hasWallpaper} addShip={() => setAddShip(true)} />
      )}
    </Flex>
  );
});

export default Auth;
