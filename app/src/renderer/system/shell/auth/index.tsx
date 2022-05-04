import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Flex } from '../../../components';
import { Signup } from './signup';
import { Login } from './login';
import { AuthProvider, authState, useAuth } from '../../../logic/store';
import { AuthShipType } from '../../../../core/auth/store';

type LoginProps = {
  hasWallpaper?: boolean;
  isFullscreen?: boolean;
};

export const Auth: FC<LoginProps> = observer((props: LoginProps) => {
  const { authStore, signupStore } = useAuth();
  const { hasWallpaper } = props;

  const [signup, setSignup] = useState(authStore.firstTime);
  const continueSignup = (ship: AuthShipType) => {
    signupStore.setSignupShip(ship);
    setSignup(true);
  };

  const addShip = () => {
    signupStore.clearSignupShip();
    setSignup(true);
  };

  // useEffect(() => {
  //   if (!authStore.hasShips && authStore.hasInProgressShips()) {

  //   }
  // }, []);
  // const [signup, setSignup] = useState(true);

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      {signup ? (
        <Signup goToLogin={() => setSignup(false)} />
      ) : (
        <Login
          hasWallpaper={hasWallpaper}
          continueSignup={(ship: any) => continueSignup(ship)}
          addShip={() => addShip()}
        />
      )}
    </Flex>
  );
});

export default Auth;
