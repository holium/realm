import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { Signup } from './signup';
import { Login } from './login';
import { useServices } from '../../logic/store-2';
// import { useAuth } from 'renderer/logic/store';
import { AuthShipType } from 'core-a/auth/store';

type LoginProps = {
  hasWallpaper?: boolean;
  isFullscreen?: boolean;
};

export const Auth: FC<LoginProps> = observer((props: LoginProps) => {
  const { identity } = useServices();
  const { auth, signup } = identity;
  const { hasWallpaper } = props;

  const [isSignup, setSignup] = useState(auth.firstTime);
  const continueSignup = (ship: AuthShipType) => {
    signup.setSignupShip(ship);
    setSignup(true);
  };

  const addShip = () => {
    signup.clearSignupShip();
    setSignup(true);
  };

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      {isSignup ? (
        <Signup firstTime={auth.firstTime} goToLogin={() => setSignup(false)} />
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
