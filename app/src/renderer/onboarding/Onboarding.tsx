import { observer } from 'mobx-react';
import { Fill } from 'react-spaces';
import { Flex } from '@holium/design-system';
import { LoginDialog } from '@holium/shared';

const OnboardingPresenter = () => {
  return (
    <Fill>
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <LoginDialog
          onNoAccount={() => {}}
          onLogin={() => Promise.resolve(false)}
        />
      </Flex>
    </Fill>
  );
};

export const Onboarding = observer(OnboardingPresenter);
