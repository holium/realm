import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex } from '../../../components';
import { Signup } from './signup';
import { Login } from './login';
import { useMst } from '../../../logic/store';

type LoginProps = {
  textTheme: 'light' | 'dark';
  hasWallpaper?: boolean;
  isFullscreen?: boolean;
};

export const Auth: FC<LoginProps> = observer((props: LoginProps) => {
  const { configStore } = useMst();
  const { textTheme, hasWallpaper } = props;
  const [signup, setSignup] = useState(configStore.firstTime);
  // const [signup, setSignup] = useState(true);

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      {signup ? (
        <Signup goToLogin={() => setSignup(false)} />
      ) : (
        <Login
          textTheme={textTheme}
          hasWallpaper={hasWallpaper}
          addShip={() => setSignup(true)}
        />
      )}
    </Flex>
  );
});

export default Auth;
