import { ViewPort } from 'react-spaces';
import { observer } from 'mobx-react';

import { Login } from './login/Login';

type Props = {
  onAddServer: () => void;
};

const AuthPresenter = ({ onAddServer }: Props) => (
  <ViewPort>
    <Login addServer={onAddServer} />
  </ViewPort>
);

export const Auth = observer(AuthPresenter);
