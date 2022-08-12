import { FC } from 'react';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { Flex, Text } from 'renderer/components';

type RecentActivityProps = {
  isOpen?: boolean;
};

export const RecentActivity: FC<RecentActivityProps> = observer(
  (props: RecentActivityProps) => {
    const { isOpen } = props;
    const { spaces } = useServices();

    return (
      <Flex flex={1}>
        <Text variant="h3" fontWeight={500}>
          Recent Activity
        </Text>
      </Flex>
    );
  }
);
