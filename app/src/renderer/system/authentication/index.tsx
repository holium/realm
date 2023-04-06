import { useState } from 'react';
import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { Login } from './login';
// import { OnboardingActions } from 'renderer/logic/actions/onboarding';
// import { useServices } from 'renderer/logic/store';

const AuthPresenter = () => {
  // const {} = useAppState();
  // const { onboarding } = useServices();
  const [_, setAddShip] = useState(false);

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

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Login addShip={() => setAddShip(true)} />
    </Flex>
  );
};

export const Auth = observer(AuthPresenter);
