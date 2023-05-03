import { ViewPort } from 'react-spaces';
import { observer } from 'mobx-react';

import { Login } from './login/Login';

const AuthPresenter = () => (
  <ViewPort>
    <Login />
  </ViewPort>
);

export const Auth = observer(AuthPresenter);
