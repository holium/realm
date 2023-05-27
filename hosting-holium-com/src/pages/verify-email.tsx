import { FormikValues } from 'formik';

import { OnboardingStorage, VerifyEmailDialog } from '@holium/shared';

import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

export default function VerifyEmail() {
  const { goToPage } = useNavigation();

  const onResend = () => {
    const { email, passwordHash } = OnboardingStorage.get();

    // TODO: unhash
    const password = passwordHash;

    if (email && password) {
      try {
        thirdEarthApi.register(email, password);
      } catch (error) {
        console.error(error);
        goToPage('/');
      }
    }
  };

  const onBack = () => goToPage('/');

  const onNext = async ({ verificationcode }: FormikValues) => {
    try {
      const result = await thirdEarthApi.verifyEmail(verificationcode);
      OnboardingStorage.set({ token: result.token });

      if (Boolean(result)) {
        return goToPage('/choose-id');
      } else {
        return false;
      }
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
