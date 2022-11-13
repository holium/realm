import { FC, useMemo, useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import {
  Button,
  Flex,
  FormControl,
  Grid,
  Label,
  Input,
  Icons,
  Text,
  TextButton,
  Box,
  Spinner,
} from 'renderer/components';
import styled, { css } from 'styled-components';

import { ShellActions } from 'renderer/logic/actions/shell';
import { useServices } from 'renderer/logic/store';
import { AppType, UrbitAppType } from 'os/services/spaces/models/bazaar';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { rgba } from 'polished';

const sizes = {
  sm: 32,
  md: 48,
  lg: 120,
  xl: 148,
  xxl: 210,
};
const radius = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 20,
};

const TileStyle = styled(Box)`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  user-select: none;
  border: 1px solid #00000010;
  img {
    --webkit-user-select: none;
    --khtml-user-select: none;
    --moz-user-select: none;
    --o-user-select: none;
    user-select: none;
  }
`;

interface AppDetailProps {
  loading: boolean;
  appId: string;
}

const KPI = (props: { title: string; value: string }) => {
  return (
    <Flex flexDirection="row" justifyContent="flex-start">
      <Text fontWeight={500} flex={1} margin={'auto'}>
        {props.title}
      </Text>
      <Text flex={3} mx={4}>
        {props.value}
      </Text>
    </Flex>
  );
};

export const AppDetailDialog: (dialogProps: AppDetailProps) => DialogConfig = (
  dialogProps: AppDetailProps
) => {
  return {
    component: observer((props: AppDetailProps) => {
      const { theme, bazaar } = useServices();
      const { loading, appId } = dialogProps;
      const app = bazaar.getApp(appId || 'campfire')! as AppType;

      let image = app.image;
      if (app && app.href && app.href.site) {
        // for the case an image is served by the ship
        // we wont have it until install, so set to null
        image = null;
      }
      let title = app.title;
      if (app && app.href && !app.title) {
        title = app.id.split('/')[1];
      }
      const isInstalled = app.installStatus === 'installed';
      // const isInstalled = false;
      const tileSize = 110;

      console.log(toJS(app));

      return (
        <Flex flex={1} flexDirection="column" justifyContent="flex-start">
          <Flex flexDirection="row" gap={20}>
            <TileStyle
              onContextMenu={(evt: any) => {
                evt.stopPropagation();
              }}
              minWidth={sizes.sm}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
              }}
              height={tileSize}
              width={tileSize}
              backgroundColor={app.color || '#F2F3EF'}
            >
              {image && (
                <img
                  style={{ pointerEvents: 'none' }}
                  draggable="false"
                  height={tileSize}
                  width={tileSize}
                  src={image}
                />
              )}
              {app.icon && <Icons name={app.icon} height={50} width={50} />}
            </TileStyle>
            <Flex flexDirection="column" justifyContent="center" flex={1}>
              <Text
                mt={1}
                fontWeight={500}
                fontSize={6}
                color={theme.currentTheme.textColor}
                style={{
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </Text>
              <Text
                mt={2}
                fontSize={3}
                color={rgba(theme.currentTheme.textColor, 0.4)}
              >
                {app.info}
              </Text>
              <Flex
                mt={3}
                flexDirection="row"
                justifyContent="flex-start"
                gap={10}
              >
                <Button
                  borderRadius={6}
                  paddingTop="6px"
                  paddingBottom="6px"
                  variant={isInstalled ? 'disabled' : 'primary'}
                  fontWeight={500}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {isInstalled ? 'Installed' : 'Install'}
                </Button>
                <Button
                  borderRadius={6}
                  paddingTop="6px"
                  paddingBottom="6px"
                  variant="minimal"
                  fontWeight={500}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Copy app link
                </Button>
              </Flex>
            </Flex>
          </Flex>
          <Flex mt={40} gap={40} flex={1} flexDirection="column">
            <KPI title="Developer desk" value={`~zod/${app.id}`} />
            <KPI title="Version" value={app.version} />
            <KPI title="Installed to" value={`%${app.id}`} />
            <KPI title="Website" value={app.website} />
          </Flex>
        </Flex>
      );
    }),
    onClose: () => {
      ShellActions.closeDialog();
    },
    window: {
      id: 'app-detail-dialog',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 650,
        height: 450,
      },
    },
    hasCloseButton: true,
    unblurOnClose: false,
    draggable: false,
  } as DialogConfig;
};
