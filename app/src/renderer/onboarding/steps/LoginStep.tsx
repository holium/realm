import { LoginDialog } from '@holium/shared';
import { StepProps } from './types';
import { thirdEarthApi } from '../thirdEarthApi';

export const LoginStep = ({ setStep }: StepProps) => {
  const onNoAccount = () => setStep('/');

  const onLogin = async (email: string, password: string) => {
    try {
      const response = await thirdEarthApi.login(email, password);
      localStorage.setItem('token', response.token);

      // IF HOSTED go to login page with all hosted ships preloaded
      // IF NOT HOSTED show add self hosted flow or Signup flow
      const userShips = await thirdEarthApi.getUserShips(response.token);
      const hasShips = userShips.length > 0;
      if (hasShips) {
        // If the (every) ship has a passport, go to the app.
        // Else go to the passport step.
      } else {
        // Go to the hosted / self hosted step.
      }

      return Boolean(response);
    } catch (error) {
      console.error(error);

      return false;
    }
  };

  return <LoginDialog onNoAccount={onNoAccount} onLogin={onLogin} />;
};
