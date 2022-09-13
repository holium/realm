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
    // console.log(toJS(bazaar));

    useEffect(() => {
      if (currentSpace) {
        // console.log('recommendedApps => %o', currentBazaar.recommendedApps);
        setApps(currentBazaar?.recommendedApps);
      }
    }, [currentSpace, currentSpace && currentBazaar.recommendedApps]);

    return (
      <Flex flexGrow={0} flexDirection="column" gap={20} mb={60}>
        <Text variant="h3" fontWeight={500}>
          Recommended Apps
        </Text>

        {(apps.length === 0 && (
          <Text variant="h6" opacity={0.4}>
            No recommendations. Start liking apps in this space to show them
            here!
          </Text>
        )) ||
          apps.map((app: any) => {
            return (
              <Flex flex={2} flexWrap="wrap" key={app.id}>
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
