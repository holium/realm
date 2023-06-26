import { Anchor, Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogSubTitle,
} from '../../components/OnboardDialog.styles';

export const BYOPInformation = () => (
  <Flex flexDirection="column" gap="8px">
    <OnboardDialogSubTitle>Upload an ID</OnboardDialogSubTitle>
    <OnboardDialogDescription>
      Move your existing identity with all of its apps, subscriptions, and
      configurations to Holium hosting.{' '}
      <Anchor
        href="https://docs.holium.com/realm/hosting/byop-pier"
        target="_blank"
      >
        Learn more
      </Anchor>
      .
    </OnboardDialogDescription>
  </Flex>
);
