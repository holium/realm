import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { Flex, Text } from 'renderer/components';
import { AppPreview } from './AppPreview';

const RecommendedAppsPresenter = () => {
  const { spaces, bazaar } = useServices();

  const currentSpace = spaces.selected;
  if (!currentSpace) return null;
  const apps = bazaar.getRecommendedApps(currentSpace.path);

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
};

export const RecommendedApps = observer(RecommendedAppsPresenter);
