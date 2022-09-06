import React, { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Card, Flex, Box, Text, Sigil, Input, Icons, RadioList } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { darken, lighten } from 'polished';
import { ThemePanel } from './components/Theme';
import { SystemPanel } from './components/System';
import { AboutPanel } from './components/About';
import { HelpPanel } from './components/Help';
import { AccountPanel } from './components/Account';

export const SystemApp: FC<any> = observer(() => {
  const { desktop, ship, contacts } = useServices();
  const { windowColor } = desktop.theme;
  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);


  const person = ship!.patp;
  const contact = contacts.getContactAvatarMetadata(person);

  type SystemPanelType = 'system' | 'theme' | 'account' | 'about' | 'help' | undefined;

  const [systemPanel, setSystemPanelType] =
          useState<SystemPanelType>('account');


  return (

    <Flex height={'100%'}>

      <Flex gap={12} flexDirection="row" width={'100%'}>
        {/* left hand side, list selector view */}
        <Flex gap={12} flexDirection="column" p="12px" width={'25%'}>
          
          <Flex flexDirection='row' alignItems='center' gap={8}>
            {/* sig and patp */}
            <Sigil
                // borderColor={backgroundColor}
                borderRadiusOverride="4px"
                simple
                size={55}
                avatar={ship!.avatar}
                patp={person}
                color={[(ship!.color) || '#000000', 'white']}
              />
            <Flex flexDirection='column' ml={2}>
              
              {ship!.nickname && 
              <Text fontWeight={500}>
              {ship!.nickname}
              </Text>
              }
              <Text fontWeight={300}>
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
              backgroundColor: desktop.theme.inputColor,

              // borderColor: rgba(backgroundColor, 0.7),
            }}
            rightIcon={
              <Flex mr={2} flexDirection="row" alignItems="center">
                <Icons name="Search" opacity={0.5} />
              </Flex>
            }
            />
          </Flex> */}

          <Flex overflowY='scroll' flexDirection='row' minWidth={'100%'}>
            {/* menu / list  */}
            <RadioList
              customBg={windowColor}
              textColor={desktop.theme.textColor}
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
});
