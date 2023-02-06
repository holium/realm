import { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Sigil, RadioList } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { lighten } from 'polished';
import { ThemePanel } from './components/Theme';
import { SystemPanel } from './components/System';
import { AboutPanel } from './components/About';
import { HelpPanel } from './components/Help';
import { AccountPanel } from './components/Account';
import { Avatar } from '@holium/design-system';

const SystemAppPresenter = () => {
  const { theme, ship, contacts } = useServices();
  const { windowColor } = theme.currentTheme;
  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

  const person = ship!.patp;
  const contact = contacts.getContactAvatarMetadata(person);

  type SystemPanelType =
    | 'system'
    | 'theme'
    | 'account'
    | 'about'
    | 'help'
    | undefined;

  const [systemPanel, setSystemPanelType] = useState<SystemPanelType>('theme');

  return (
    <Flex height={'100%'}>
      <Flex gap={0} flexDirection="row" flex={5} overflowX="hidden">
        {/* left hand side, list selector view */}
        <Flex gap={12} flexDirection="column" p="12px">
          <Flex
            flexDirection="row"
            alignItems="center"
            gap={8}
            maxWidth={'220px'}
          >
            {/* sig and patp */}
            <Avatar
              // borderColor={backgroundColor}
              borderRadiusOverride="4px"
              simple
              size={55}
              avatar={ship!.avatar}
              patp={person}
              sigilColor={[ship!.color || '#000000', 'white']}
            />
            <Flex
              flexDirection="column"
              ml={2}
              overflowX={'hidden'}
              style={{
                overflowWrap: 'break-word',
              }}
            >
              {ship!.nickname && (
                <Text fontWeight={500} fontSize={2}>
                  {ship!.nickname}
                </Text>
              )}
              <Text fontWeight={300} fontSize={2}>
                {ship!.patp}
              </Text>
            </Flex>
          </Flex>

          {/* <Flex width={'100%'}>
            <Input
            className="realm-cursor-text-cursor"
            type="text"
            placeholder="Search settings..."
            wrapperStyle={{
              cursor: 'none',
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

          <Flex overflowY="auto" flexDirection="row" flex={4}>
            {/* menu / list  */}
            <RadioList
              customBg={windowColor}
              textColor={theme.currentTheme.textColor}
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

        <Flex maxHeight={'100%'} overflowY="auto" width={'75%'}>
          {systemPanel === 'system' && <SystemPanel />}
          {systemPanel === 'theme' && <ThemePanel />}
          {systemPanel === 'account' && <AccountPanel />}
          {systemPanel === 'about' && <AboutPanel />}
          {systemPanel === 'help' && <HelpPanel />}
        </Flex>
      </Flex>
    </Flex>
  );
};

export const SystemApp = observer(SystemAppPresenter);
