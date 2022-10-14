import { FC } from 'react';
import styled from 'styled-components';
import { rgba } from 'polished';
import { Flex, Text, Box, AppTile, Button } from 'renderer/components';
import { AppType, InstallStatus } from 'os/services/spaces/models/bazaar-old';

const AppEmpty = styled(Box)`
  border-radius: 16px;
  border: 2px dotted white;
  transition: 0.2s ease;
  &:hover {
    transition: 0.2s ease;
    background: ${rgba('#FFFFFF', 0.12)};
  }
`;

type AppPreviewProps = {
  app?: AppType;
  // isDownloaded?: boolean;
  // ?: string;
};

export const AppPreview: FC<AppPreviewProps> = (props: AppPreviewProps) => {
  const { app } = props;
  const info = app!.info!;
  const length = 60;
  // console.log('AppPreview => %o', app);
  return (
    <Flex flexGrow={0} flexDirection="row" gap={16}>
      <AppTile
        tileSize="lg"
        isAnimated={false}
        app={app}
        onAppClick={(selectedApp: AppType) => {}}
      />
      <Flex
        pt="6px"
        pb="6px"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Flex flexDirection="column" mr={24} gap={6}>
          <Text fontWeight={500} fontSize={4}>
            {app?.title}
          </Text>
          <Text fontSize={2} opacity={0.6}>
            {info.length > length ? `${info.substring(0, length)}...` : info}
          </Text>
        </Flex>
        <Flex flexGrow={0}>
          {app?.type !== 'urbit' ||
          (app?.type === 'urbit' &&
            app?.installStatus === InstallStatus.installed) ? (
            <Button borderRadius={6} opacity={0.3} variant="primary">
              Installed
            </Button>
          ) : (
            <Button variant="primary" borderRadius={6} onClick={() => {}}>
              Install
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
