import { ViewPort } from 'react-spaces';
import { observer } from 'mobx-react';

import { Login } from './login/Login';

type Props = {
  onAddShip: () => void;
};

const AuthPresenter = ({ onAddShip }: Props) => (
  <ViewPort>
    <Login addShip={onAddShip} />
  </ViewPort>
);

export const Auth = observer(AuthPresenter);
