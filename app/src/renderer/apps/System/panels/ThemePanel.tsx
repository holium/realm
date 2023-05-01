import { useState } from 'react';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';
import { RadioGroup, RadioImages } from '@holium/design-system/inputs';

import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { CustomWallpaper } from '../components/CustomWallpaper';
import { SettingControl } from '../components/SettingControl';
import { SettingPane } from '../components/SettingPane';
import { SettingSection } from '../components/SettingSection';
import { SettingTitle } from '../components/SettingTitle';
import { wallpapers } from '../components/wallpapers';

const WallpaperPreview = styled(motion.img)`
  width: 300px;
  height: 'auto';
  border-radius: 6px;
  transition: all 0.25s ease;
  -webkit-user-drag: none;
`;

const ThemePanelPresenter = () => {
  const { theme, loggedInAccount } = useAppState();
  const { spacesStore } = useShipStore();
  const [wallpaperOption, setWallpaperOption] = useState<string>('gallery');

  if (!spacesStore.selected || !loggedInAccount) return null;

  const canEditSpace =
    spacesStore.selected.members.list.findIndex(
      (m) =>
        m.patp === loggedInAccount.serverId && m.roles.indexOf('admin') !== -1
    ) !== -1;

  const setNewTheme = async (wallpaperSrc: string) => {
    const newTheme = await theme.setWallpaper(wallpaperSrc);

    const currentSpace = spacesStore.spaces.get(
      spacesStore.selected?.path ?? ''
    );
    if (!currentSpace) {
      console.warn('space not found in spacesStore');
      return;
    }

    await currentSpace.setTheme(newTheme);
  };

  return (
    <SettingPane>
      <SettingTitle title="Theme" />
      <SettingSection
        title="Wallpaper"
        body={
          <Flex flexDirection="column" gap="16px">
            <SettingControl>
              <Flex flex={1} justifyContent="center">
                <WallpaperPreview src={theme.wallpaper} />
              </Flex>
            </SettingControl>
            {canEditSpace ? (
              <Flex flexDirection="column" gap="4px">
                <RadioGroup
                  options={[
                    { label: 'Gallery', value: 'gallery' },
                    { label: 'Custom url', value: 'custom' },
                  ]}
                  selected={wallpaperOption}
                  onClick={setWallpaperOption}
                />
                {wallpaperOption === 'gallery' && (
                  <SettingControl>
                    <RadioImages options={wallpapers} onClick={setNewTheme} />
                  </SettingControl>
                )}
                {wallpaperOption === 'custom' && (
                  <SettingControl>
                    <CustomWallpaper
                      initialWallpaper={theme.wallpaper}
                      onSave={setNewTheme}
                    />
                  </SettingControl>
                )}
              </Flex>
            ) : (
              <Text.Body opacity={0.5} fontStyle="italic">
                You lack permissions to edit this space.
              </Text.Body>
            )}
          </Flex>
        }
      />
    </SettingPane>
  );
};

export const ThemePanel = observer(ThemePanelPresenter);
