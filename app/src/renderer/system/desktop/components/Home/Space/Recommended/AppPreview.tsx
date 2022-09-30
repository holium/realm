import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ShellActions } from 'renderer/logic/actions/shell';
import { toJS } from 'mobx';
import { Flex, Text, Box, AppTile, Button } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { AppType } from 'os/services/spaces/models/bazaar';
import { DesktopActions } from 'renderer/logic/actions/desktop';

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
          (app?.type === 'urbit' && app?.installed) ? (
            <Button
              borderRadius={6}
              opacity={0.3}
              variant="primary"
              onClick={() => {}}
            >
              Installed
            </Button>
          ) : (
            <Button variant="primary" disabled borderRadius={6}>
              Install
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
