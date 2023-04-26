import { useState } from 'react';
import { observer } from 'mobx-react';

import { Avatar, Box, Flex, RadioList, Text } from '@holium/design-system';

import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { AboutPanel } from './pages/About';
import { AccountPanel } from './pages/Account';
import { HelpPanel } from './pages/Help';
import { SystemPanel } from './pages/System';
import { ThemePanel } from './pages/Theme';

type SystemPanelType =
  | 'system'
  | 'theme'
  | 'account'
  | 'about'
  | 'help'
  | string
  | undefined;

const SystemAppPresenter = () => {
  const { shellStore } = useAppState();
  const { ship } = useShipStore();

  const defaultRoute: SystemPanelType =
    shellStore.nativeConfig?.get('os-settings')?.route;
  const [systemPanel, setSystemPanelType] = useState<SystemPanelType>(
    defaultRoute || 'theme'
  );

  if (!ship) return null;

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
              avatar={ship.avatar}
              patp={ship.patp}
              sigilColor={[ship.color || '#000000', 'white']}
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
            {ship.nickname && (
              <Text.Custom fontWeight={500} fontSize={2}>
                {ship.nickname}
              </Text.Custom>
            )}
            <Text.Custom fontWeight={300} fontSize={2}>
              {ship.patp}
            </Text.Custom>
          </Flex>
        </Flex>

        {/* <Flex width={'100%'}>
            <Input
            type="text"
            placeholder="Search settings..."
            wrapperStyle={{
              borderRadius: 9,
              backgroundColor: theme.currentTheme.inputColor,

              // borderColor: rgba(backgroundColor, 0.7),
            }}
            rightIcon={
              <Flex mr={2} flexDirection="row" alignItems="center">
                <Icons name="Search" opacity={0.5} />
              </Flex>
            }
            />
          </Flex> */}

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
                sublabel: 'Profile, hosting info',
              },
              {
                icon: 'Holium',
                label: 'About',
                value: 'about',
                sublabel: 'Build number, IDs, etc.',
              },
              {
                icon: 'QuestionCircle',
                label: 'Help',
                value: 'help',
                sublabel: 'Support and Documentation',
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
