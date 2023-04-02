import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { Login } from './login';
import { Onboarding } from 'renderer/system/onboarding/Onboarding';
// import { OnboardingActions } from 'renderer/logic/actions/onboarding';
// import { useServices } from 'renderer/logic/store';
import { Splash } from './Splash';
import { useAppState } from 'renderer/stores/app.store';

const AuthPresenter = () => {
  const {} = useAppState();
  // const { onboarding } = useServices();
  const [addShip, setAddShip] = useState(false);

  // useEffect(() => {
  //   // This is an event that is fired when onboarding is completed
  //   OnboardingActions.onExit(() => {
  //     setAddShip(false);
  //   });
  // }, []);

  // if (!onboarding.seenSplash) {
  //   return (
  //     <Flex height="100vh" alignItems="center" justifyContent="center">
  //       <Splash />
  //     </Flex>
  //   );
  // }
  const firstTime = false;
  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      {addShip ? (
        <Onboarding firstTime={firstTime} exit={() => setAddShip(false)} />
      ) : (
        <Login addShip={() => setAddShip(true)} />
      )}
    </Flex>
  );
};

export const Auth = observer(AuthPresenter);
