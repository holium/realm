import { observer } from 'mobx-react';
import { Flex, Text } from 'renderer/components';

export const RecentActivity = observer(() => (
  <Flex flex={1} flexDirection="column" gap={20}>
    <Text variant="h3" fontWeight={500}>
      Recent Activity
    </Text>
    <Text variant="h6" opacity={0.4}>
      No recent activity. Interact with this space to see recent activity in
      action!
    </Text>
  </Flex>
));
