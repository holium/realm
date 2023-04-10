import { Fill } from 'react-spaces';
import { Flex } from '@holium/design-system';
import { OnboardingStep } from './OnboardingStep';

export const Onboarding = () => (
  <Fill>
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <OnboardingStep />
    </Flex>
  </Fill>
);
