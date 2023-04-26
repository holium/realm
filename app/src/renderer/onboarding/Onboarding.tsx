import { Fill } from 'react-spaces';

import { Flex } from '@holium/design-system';

import { OnboardingStep, OnboardingStepProps } from './OnboardingStep';

export const Onboarding = ({ initialStep, onFinish }: OnboardingStepProps) => (
  <Fill>
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <OnboardingStep initialStep={initialStep} onFinish={onFinish} />
    </Flex>
  </Fill>
);
