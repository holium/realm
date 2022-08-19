import { FC } from 'react';
import styled from 'styled-components';
import { rgba } from 'polished';

import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { Flex, Box, Text } from 'renderer/components';

type RecentActivityProps = {
  isOpen?: boolean;
};

const Row = styled(Box)`
  border-radius: 12px;
  /* border: 2px dotted white; */
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
  background: ${rgba('#FBFBFB', 0.2)};
  /* &:hover {
    transition: 0.2s ease;
    background: ${rgba('#FFFFFF', 0.5)};
  } */
`;

export const RecentActivity: FC<RecentActivityProps> = observer(
  (props: RecentActivityProps) => {
    const { isOpen } = props;
    const { spaces } = useServices();

    return (
      <Flex flex={1} flexDirection="column" gap={20}>
        <Text variant="h3" fontWeight={500}>
          Recent Activity
        </Text>
        <Text variant="h6">
          No recent activity. Interact with this space to see recent activity in
          action!
        </Text>
        {/* <Row />
        <Row />
        <Row />
        <Row /> */}
      </Flex>
    );
  }
);
