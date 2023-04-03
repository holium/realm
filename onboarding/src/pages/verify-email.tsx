import { VerifyEmailDialog } from '@holium/shared';
import { Page } from 'components/Page';
import { api } from '../util/api';
import { useNavigation } from '../util/useNavigation';

export default function VerifyEmail() {
  const { goToPage } = useNavigation();

  const onResend = () => {
    const email = localStorage.getItem('email');
    const password = localStorage.getItem('password');

    if (email && password) {
      try {
        api.register(email, password);
      } catch (error) {
        console.error(error);
        goToPage('/');
      }
    }
  };

  const onBack = () => goToPage('/');

  const onNext = async (verificationcode: string) => {
    try {
      const result = await api.verifyEmail(verificationcode);
      localStorage.setItem('token', result.token);

      goToPage('/choose-id');

      return Boolean(result);
    } catch (error) {
      console.error(error);

      return false;
    }
  };

  return (
    <Page title="Verify email">
      <VerifyEmailDialog onResend={onResend} onBack={onBack} onNext={onNext} />
    </Page>
  );
}
