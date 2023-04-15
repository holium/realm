import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { Login } from './login';
// import { OnboardingActions } from 'renderer/logic/actions/onboarding';
// import { Splash } from './Splash';
// import { useAppState } from 'renderer/stores/app.store';

const AuthPresenter = () => {
  // const {} = useAppState();
  // const { onboarding } = useServices();

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
      <Login addShip={() => console.log('toggle onboarding')} />
    </Flex>
  );
};

export const Auth = observer(AuthPresenter);
