import { FormikValues } from 'formik';

import { OnboardingStorage } from '@holium/shared';

import { CreateAccountWithWalletDialog } from '../../../shared/src/onboarding/dialogs/CreateAccountWithWallet/CreateAccountWithWalletDialog';
import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

// type ServerSideProps = {};

// export const getServerSideProps: GetServerSideProps = async ({}) => {
//   return {
//     props: {},
//   };
// };

export default function CreateAccount() {
  const { goToPage } = useNavigation();

  const onNext = async ({ email, password }: FormikValues) => {
    // TODO: hash password
    OnboardingStorage.set({ email, passwordHash: password });

    try {
      const result = await thirdEarthApi.register(email, password);
      if (result) {
        return goToPage('/verify-email', {
          product_type: 'planet',
        });
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <Page title="Create your account">
      <CreateAccountWithWalletDialog onNext={onNext} />
    </Page>
  );
}
