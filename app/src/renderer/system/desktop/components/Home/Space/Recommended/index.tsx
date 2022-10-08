import { FC, useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { useServices } from 'renderer/logic/store';
import { Flex, Text } from 'renderer/components';
import { AppPreview } from './AppPreview';

type RecommendedAppsProps = {
  isOpen?: boolean;
};

export const RecommendedApps: FC<RecommendedAppsProps> = observer(
  (props: RecommendedAppsProps) => {
    const { isOpen } = props;
    const [apps, setApps] = useState<any>([]);
    const { spaces, bazaar } = useServices();

    const currentSpace = spaces.selected!;
    const currentBazaar = bazaar.spaces.get(currentSpace.path);

    useEffect(() => {
      if (currentSpace) {
        setApps(bazaar.getRecommendedApps(currentSpace.path));
      }
    }, [currentSpace, bazaar.appsChange]);

    return (
      <Flex flexGrow={0} flexDirection="column" gap={20} mb={60}>
        <Text variant="h3" fontWeight={500}>
          Recommended Apps
        </Text>

        {!apps ||
          (apps.length === 0 && (
            <Text variant="h6" opacity={0.4}>
              No recommendations. Start liking apps in this space to show them
              here!
            </Text>
          )) || (
            <Flex width="880px" flexWrap="wrap" flexDirection="row">
              {apps.map((app: any) => {
                return (
                  <Flex key={app.id} width="50%" flexBasis="50%" mb="40px">
                    <AppPreview app={app} />
                  </Flex>
                );
              })}
            </Flex>
          )}
      </Flex>
    );
  }
);
