import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { Signup } from './signup';
import { Login } from './login';
import { useAuth } from 'renderer/logic/store';
import { AuthShipType } from 'renderer/core/auth/store';

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

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      {signup ? (
        <Signup
          firstTime={authStore.firstTime}
          goToLogin={() => setSignup(false)}
        />
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
