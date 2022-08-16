import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { Login } from './login';
import { Onboarding } from 'renderer/system/onboarding/Onboarding';

type LoginProps = {
  hasWallpaper?: boolean;
  firstTime: boolean;
};

export const Auth: FC<LoginProps> = observer((props: LoginProps) => {
  const { hasWallpaper, firstTime } = props;
  const [addShip, setAddShip] = useState(false);

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
