import { useState } from 'react';
import { observer } from 'mobx-react';

import { Avatar, Box, Flex, Text } from '@holium/design-system/general';
import { RadioList } from '@holium/design-system/inputs';

import { useAppState } from 'renderer/stores/app.store';

import { AboutPanel } from './panels/AboutPanel';
import { AccountPanel } from './panels/AccountPanel';
import { HelpPanel } from './panels/HelpPanel';
import { SystemPanel } from './panels/SystemPanel';
import { ThemePanel } from './panels/ThemePanel';

type SystemPanelType =
  | 'system'
  | 'theme'
  | 'account'
  | 'about'
  | 'help'
  | string
  | undefined;

const SystemAppPresenter = () => {
  const { loggedInAccount, shellStore } = useAppState();

  const defaultRoute: SystemPanelType =
    shellStore.nativeConfig?.get('os-settings')?.route;
  const [systemPanel, setSystemPanelType] = useState<SystemPanelType>(
    defaultRoute || 'system'
  );

  if (!loggedInAccount) return null;

  return (
    <Flex flex={1} minHeight={0}>
      {/* left hand side, list selector view */}
      <Flex flex={1} gap={12} flexDirection="column" p={3}>
        <Flex flexDirection="row" alignItems="center" gap={8} width={'240px'}>
          {/* sig and patp */}
          <Box height={40} width={40}>
            <Avatar
              simple
              size={40}
              style={{
                minWidth: 40,
              }}
              avatar={loggedInAccount.avatar}
              patp={loggedInAccount.serverId}
              sigilColor={[loggedInAccount.color || '#000000', 'white']}
            />
          </Box>
          <Flex
            flexDirection="column"
            ml={2}
            overflowX={'hidden'}
            style={{
              overflowWrap: 'break-word',
            }}
          >
            {loggedInAccount.nickname && (
              <Text.Custom fontWeight={500} fontSize={2}>
                {loggedInAccount.nickname}
              </Text.Custom>
            )}
            <Text.Custom fontWeight={300} fontSize={2}>
              {loggedInAccount.serverId}
            </Text.Custom>
          </Flex>
        </Flex>

        <Flex flex={1} overflowY="auto">
          {/* menu / list  */}
          <RadioList
            selected={systemPanel}
            options={[
              {
                icon: 'System',
                label: 'System',
                value: 'system',
                sublabel: 'Display, sounds, notifications',
              },
              {
                icon: 'Palette',
                label: 'Theme',
                value: 'theme',
                sublabel: 'Colors, wallpaper, customization',
              },
              {
                icon: 'AccountSettings',
                label: 'Account',
                value: 'account',
                sublabel: 'Passport, server info',
              },
              {
                icon: 'QuestionCircle',
                label: 'Help',
                value: 'help',
                sublabel: 'Support and Documentation',
              },
              {
                icon: 'Holium',
                label: 'About',
                value: 'about',
                sublabel: 'Build number, IDs, etc.',
              },
            ]}
            onClick={(value: SystemPanelType) => {
              setSystemPanelType(value);
            }}
          />
        </Flex>
      </Flex>

      <Flex flex={3} overflowX="hidden">
        {systemPanel === 'system' && <SystemPanel />}
        {systemPanel === 'theme' && <ThemePanel />}
        {systemPanel === 'account' && <AccountPanel />}
        {systemPanel === 'about' && <AboutPanel />}
        {systemPanel === 'help' && <HelpPanel />}
      </Flex>
    </Flex>
  );
};

export const SystemApp = observer(SystemAppPresenter);
