import { useState } from 'react';
import { observer } from 'mobx-react';

import { Avatar, Box, Flex, Text } from '@holium/design-system/general';
import { RadioList, RadioOption } from '@holium/design-system/inputs';

import { useAppState } from 'renderer/stores/app.store';

import { AboutPanel } from './panels/AboutPanel';
import { CustomDomainPanel } from './panels/CustomDomainPanel';
import { HelpPanel } from './panels/HelpPanel';
import { HostingPanel } from './panels/HostingPanel';
import { PassportPanel } from './panels/PassportPanel';
import { SelfHostingAccountPanel } from './panels/SelfHostingAccountPanel';
import { StoragePanel } from './panels/StoragePanel';
import { SystemPanel } from './panels/SystemPanel';
import { ThemePanel } from './panels/ThemePanel';

type SystemPanelType =
  | 'system'
  | 'theme'
  | 'custom-domain'
  | 'hosting'
  | 'passport'
  | 'self-hosting-account'
  | 'storage'
  | 'about'
  | 'help';

const SystemAppPresenter = () => {
  const { loggedInAccount, shellStore } = useAppState();

  const defaultRoute = (shellStore.nativeConfig?.get('os-settings')?.route ??
    'system') as SystemPanelType;
  const [systemPanel, setSystemPanelType] =
    useState<SystemPanelType>(defaultRoute);

  if (!loggedInAccount) return null;

  const isSelfHosted = loggedInAccount.serverType === 'local';

  const selfHostedOptions: RadioOption[] = [
    {
      icon: 'AccountSettings',
      label: 'Account',
      value: 'self-hosting-account',
      sublabel: 'Account, passport, server',
    },
  ];

  const holiumServerOptions: RadioOption[] = [
    {
      icon: 'AccountSettings',
      label: 'Passport',
      value: 'passport',
      sublabel: 'Your persistent identity',
    },
    {
      icon: 'Folder',
      label: 'Hosting',
      value: 'hosting',
      sublabel: 'Configure your server',
    },
    {
      icon: 'UrlLink',
      label: 'Custom Domain',
      value: 'custom-domain',
      sublabel: 'Custom server domain',
    },
    {
      icon: 'CloudDownload',
      label: 'Storage',
      value: 'storage',
      sublabel: 'S3 Storage',
    },
  ];

  const baseOptions: RadioOption[] = [
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
      icon: 'QuestionCircle',
      label: 'Help',
      value: 'help',
      sublabel: 'Support and documentation',
    },
    {
      icon: 'Holium',
      label: 'About',
      value: 'about',
      sublabel: 'Build number, IDs, etc.',
    },
  ];

  const options: RadioOption[] = isSelfHosted
    ? [
        ...baseOptions.slice(0, 2),
        ...selfHostedOptions,
        ...baseOptions.slice(2),
      ]
    : [
        ...baseOptions.slice(0, 2),
        ...holiumServerOptions,
        ...baseOptions.slice(2),
      ];

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
            options={options}
            onClick={(value: SystemPanelType) => {
              setSystemPanelType(value);
            }}
          />
        </Flex>
      </Flex>

      <Flex flex={3} overflowX="hidden">
        {systemPanel === 'system' && <SystemPanel />}
        {systemPanel === 'theme' && <ThemePanel />}
        {systemPanel === 'custom-domain' && <CustomDomainPanel />}
        {systemPanel === 'hosting' && <HostingPanel />}
        {systemPanel === 'passport' && <PassportPanel />}
        {systemPanel === 'self-hosting-account' && <SelfHostingAccountPanel />}
        {systemPanel === 'storage' && <StoragePanel />}
        {systemPanel === 'about' && <AboutPanel />}
        {systemPanel === 'help' && <HelpPanel />}
      </Flex>
    </Flex>
  );
};

export const SystemApp = observer(SystemAppPresenter);
