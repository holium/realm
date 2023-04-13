import { Anchor } from '@holium/design-system/general';
import { LoginDialog, OnboardDialogDescription } from '@holium/shared';
import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

export default function Login() {
  const { goToPage } = useNavigation();

  const onNoAccount = () => goToPage('/');

  const onLogin = async (email: string, password: string) => {
    try {
      const response = await thirdEarthApi.login(email, password);
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
      <LoginDialog
        label={
          <OnboardDialogDescription>
            Don't have an account yet?{' '}
            <Anchor onClick={onNoAccount}>Sign up</Anchor>.
          </OnboardDialogDescription>
        }
        onLogin={onLogin}
      />
    </Page>
  );
}
