import { Fill } from 'react-spaces';
import { Flex } from '@holium/design-system';
import { OnboardingStep, OnboardingStepProps } from './OnboardingStep';

export const Onboarding = ({ initialStep }: OnboardingStepProps) => (
  <Fill>
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <OnboardingStep initialStep={initialStep} />
    </Flex>
  </Fill>
);
