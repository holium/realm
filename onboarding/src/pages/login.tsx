import { LoginDialog } from '@holium/shared';
import { Page } from '../components/Page';
import { api } from '../util/api';
import { useNavigation } from '../util/useNavigation';

export default function Login() {
  const { goToPage } = useNavigation();

  const onNoAccount = () => goToPage('/');

  const onLogin = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      localStorage.setItem('token', response.token);

      goToPage('/account');

      return Boolean(response);
    } catch (error) {
      console.error(error);

      return false;
    }
  };

  return (
    <Page title="Login">
      <LoginDialog onNoAccount={onNoAccount} onLogin={onLogin} />
    </Page>
  );
}
