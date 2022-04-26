import { FC, useMemo } from 'react';
import { observer } from 'mobx-react';
import { useMst } from '../../../../../logic/store';
import { Flex, Box } from '../../../../../components';
import { cleanNounColor } from '../../../../../logic/utils/color';

export const AppGrid: FC<any> = observer(() => {
  const { spaceStore } = useMst();

  const tileSize = 'xl';

  const sizes = {
    sm: 48,
    md: 88,
    lg: 148,
    xl: 200,
  };
  const radius = {
    sm: 6,
    md: 12,
    lg: 20,
    xl: 24,
  };

  return useMemo(
    () => (
      <Flex gap={16} flexDirection="row">
        {spaceStore.appGrid.map((app) =>
          app.image ? (
            <Box
              minWidth={sizes[tileSize]}
              style={{ borderRadius: radius[tileSize], overflow: 'hidden' }}
              height={sizes[tileSize]}
              width={sizes[tileSize]}
              backgroundColor="#F2F3EF"
            >
              <img
                height={sizes[tileSize]}
                width={sizes[tileSize]}
                key={app.title}
                src={app.image}
              />
            </Box>
          ) : (
            <Box
              minWidth={sizes[tileSize]}
              style={{ borderRadius: radius[tileSize] }}
              key={app.title}
              backgroundColor={cleanNounColor(app.color)}
              height={sizes[tileSize]}
              width={sizes[tileSize]}
            ></Box>
          )
        )}
      </Flex>
    ),
    [spaceStore.apps]
  );
});
