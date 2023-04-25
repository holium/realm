import { CreateAccountDialog, OnboardingStorage } from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

export default function CreateAccount() {
  const { goToPage } = useNavigation();

  const onAlreadyHaveAccount = () => goToPage('/login');

  const onNext = async (email: string, password: string) => {
    // TODO: hash password
    OnboardingStorage.set({ email, passwordHash: password });

    try {
      const result = await thirdEarthApi.register(email, password);
      if (Boolean(result)) goToPage('/verify-email');
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
