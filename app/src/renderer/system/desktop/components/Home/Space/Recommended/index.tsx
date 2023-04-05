import { observer } from 'mobx-react';
import { Flex, Text } from '@holium/design-system';
import { AppPreview } from './AppPreview';
import { useShipStore } from 'renderer/stores/ship.store';

const RecommendedAppsPresenter = () => {
  const { spacesStore } = useShipStore();

  const currentSpace = spacesStore.selected;
  if (!currentSpace) return null;
  const apps = currentSpace.stall.recommended;

  return (
    <Flex flexGrow={0} flexDirection="column" gap={20} mb={60}>
      <Text.Custom variant="h3" fontWeight={500}>
        Recommended Apps
      </Text.Custom>

      {!apps ||
        (apps.length === 0 && (
          <Text.Custom variant="h6" opacity={0.4}>
            No recommendations. Start liking apps in this space to show them
            here!
          </Text.Custom>
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
