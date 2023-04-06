import { CreateAccountDialog } from '@holium/shared';
import { Page } from 'components/Page';
import { api } from '../util/api';
import { useNavigation } from '../util/useNavigation';

export default function CreateAccount() {
  const { goToPage } = useNavigation();

  const onAlreadyHaveAccount = () => goToPage('/login');

  const onNext = async (email: string, password: string) => {
    // Save email in local storage for later steps in the onboarding flow.
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);

    try {
      const result = await api.register(email, password);
      goToPage('/verify-email');
      return Boolean(result);
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <Page title="Create account">
      <CreateAccountDialog
        onAlreadyHaveAccount={onAlreadyHaveAccount}
        onNext={onNext}
      />
    </Page>
  );
}
