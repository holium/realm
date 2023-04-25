import { Flex, Text } from '@holium/design-system';
import { observer } from 'mobx-react';

export const RecentActivity = observer(() => (
  <Flex flex={1} flexDirection="column" gap={20}>
    <Text.Custom variant="h3" fontWeight={500}>
      Recent Activity
    </Text.Custom>
    <Text.Custom variant="h6" opacity={0.4}>
      No recent activity. Interact with this space to see recent activity in
      action!
    </Text.Custom>
  </Flex>
));
