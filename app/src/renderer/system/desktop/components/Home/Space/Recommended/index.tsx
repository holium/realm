import { FC } from 'react';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { Flex, Text } from 'renderer/components';
import { AppPreview } from './AppPreview';
import { AppModelType } from 'os/services/ship/models/docket';

type RecommendedAppsProps = {
  isOpen?: boolean;
};

export const RecommendedApps: FC<RecommendedAppsProps> = observer(
  (props: RecommendedAppsProps) => {
    const { isOpen } = props;
    const { spaces } = useServices();

    return (
      <Flex flexGrow={0} flexDirection="column" gap={20} mb={60}>
        <Text variant="h3" fontWeight={500}>
          Recommended Apps
        </Text>

        {([].length === 0 && (
          <Text variant="h6" opacity={0.4}>
            No recommendations. Start liking apps in this space to show them
            here!
          </Text>
        )) ||
          [].map((app: any) => {
            return (
              <Flex flex={2} flexWrap="wrap">
                <Flex key={app.id} flex={1}>
                  <AppPreview app={app} />
                </Flex>
              </Flex>
            );
          })}
      </Flex>
    );
  }
);
