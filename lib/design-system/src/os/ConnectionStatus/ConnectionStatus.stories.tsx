import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '../../general/Flex/Flex';
import { ConnectionStatus } from './ConnectionStatus';

export default {
  component: ConnectionStatus,
} as ComponentMeta<typeof ConnectionStatus>;

export const Default: ComponentStory<typeof ConnectionStatus> = () => (
  <Flex
    position="absolute"
    left={0}
    right={0}
    bottom={0}
    top={0}
    gap={12}
    flexDirection="column"
    className="wallpaper"
    height="100vh"
  >
    <Flex position="relative" height={60}>
      <ConnectionStatus
        serverId="~lomder-librun"
        status="disconnected"
        themeMode="light"
        onReconnect={() => {}}
        onSendBugReport={() => {}}
      />
    </Flex>
    <Flex position="relative" height={60}>
      <ConnectionStatus
        serverId="~lomder-librun"
        status="no-internet"
        themeMode="light"
        onReconnect={() => {}}
        onSendBugReport={() => {}}
      />
    </Flex>
    <Flex position="relative" height={60}>
      <ConnectionStatus
        serverId="~lomder-librun"
        status="refreshing"
        themeMode="light"
        onReconnect={() => {}}
        onSendBugReport={() => {}}
      />
    </Flex>

    <Flex position="relative" height={60}>
      <ConnectionStatus
        serverId="~lomder-librun"
        status="failed"
        themeMode="light"
        onReconnect={() => {}}
        onSendBugReport={() => {}}
      />
    </Flex>
  </Flex>
);
