import { useState } from 'react';
import { observer } from 'mobx-react';
import { ThemePanel } from './components/Theme';
import { SystemPanel } from './components/System';
import { AboutPanel } from './components/About';
import { HelpPanel } from './components/Help';
import { AccountPanel } from './components/Account';
import { Avatar, RadioList, Flex, Text, Box } from '@holium/design-system';
import { useShipStore } from 'renderer/stores/ship.store';

type SystemPanelType =
  | 'system'
  | 'theme'
  | 'account'
  | 'about'
  | 'help'
  | undefined;

const SystemAppPresenter = () => {
  const { ship } = useShipStore();

  const [systemPanel, setSystemPanelType] = useState<SystemPanelType>('theme');

  if (!ship) return null;

  return (
    <Flex flex={1} minHeight={0}>
      {/* left hand side, list selector view */}
      <Flex flex={1} gap={12} flexDirection="column" p={3}>
        <Flex flexDirection="row" alignItems="center" gap={8} width={'240px'}>
          {/* sig and patp */}
          <Box height={55} width={55}>
            <Avatar
              borderRadiusOverride="4px"
              simple
              size={55}
              style={{
                minWidth: 55,
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
