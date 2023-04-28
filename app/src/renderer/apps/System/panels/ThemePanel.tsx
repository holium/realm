import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useField, useForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import {
  Box,
  Button,
  RadioGroup,
  RadioImages,
  TextInput,
} from '@holium/design-system';

import { useAppState } from 'renderer/stores/app.store';
import { MobXAccount } from 'renderer/stores/models/account.model';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import { ThemeType } from 'renderer/stores/models/theme.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { SettingControl } from '../components/SettingControl';
import { SettingPane } from '../components/SettingPane';
import { SettingSection } from '../components/SettingSection';
import { SettingTitle } from '../components/SettingTitle';

const WallpaperPreview = styled(motion.img)`
  width: 300px;
  height: 'auto';
  border-radius: 6px;
  transition: all 0.25s ease;
  -webkit-user-drag: none;
`;

type wpOptionType =
  | 'blueorb'
  | 'darkneon'
  | 'hallway'
  | 'sunorb'
  | 'jiggleorb'
  | 'sliceball'
  | undefined;

const wpGallery: { [key: string]: string } = {
  blueorb:
    'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2574&q=80',
  nightcity:
    'https://images.unsplash.com/photo-1655463223445-7c7cc696fdf8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  oranges:
    'https://images.unsplash.com/photo-1656567229591-72a12a4cb0d6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  water:
    'https://images.unsplash.com/photo-1660469770527-cd73fbc59cc3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  forestfog:
    'https://images.unsplash.com/photo-1661749232278-3c8380532c07?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2072&q=80',
  darkneon:
    'https://images.unsplash.com/photo-1650943574955-ac02c65cfc71?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2942&q=80',
  ogdefault:
    'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=80',
  // 'hallway' : 'https://images.unsplash.com/photo-1622798023168-76a8f3b1f24e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3864&q=80',
  // 'sunorb'    : 'https://images.unsplash.com/photo-1636408807362-a6195d3dd4de?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3264&q=80',
  // 'jiggleorb' : 'https://images.unsplash.com/photo-1633783156075-a01661455344?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3264&q=80',
  // 'sliceball' : 'https://images.unsplash.com/photo-1627037558426-c2d07beda3af?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3075&q=80 ',
};

type ThemePanelPresenterViewProps = {
  account: MobXAccount;
  space: SpaceModelType;
};

const ThemePanelPresenterView = ({
  account,
  space,
}: ThemePanelPresenterViewProps) => {
  const { theme } = useAppState();
  const { spacesStore } = useShipStore();
  const [wpOption, setWpOption] = useState<wpOptionType>(undefined);
  const [wallpaperOption, setWallpaperOption] = useState<string>('gallery');

  const canEditSpace = useMemo(() => {
    const me = space.members.list.find(
      (m) => m.patp === account.patp && m.roles.indexOf('admin') !== -1
    );

    return Boolean(me);
  }, [account.patp]);

  const updateSpaceTheme = async (newTheme: ThemeType) => {
    const currentSpace = spacesStore.spaces.get(space.path);
    if (!currentSpace) {
      console.warn('space not found in spacesStore');
      return;
    }
    await currentSpace.setTheme(newTheme);
  };

  const themeForm = useForm({
    async onSubmit({ values }: any) {
      if (!canEditSpace) {
        // this shouldnt happen, blocked at validate form
        return;
      }

      let newTheme: ThemeType;
      if (values.customWallpaper !== '') {
        customWallpaper.actions.onChange('');
        newTheme = (await theme.setWallpaper(
          values.customWallpaper
        )) as ThemeType;
      } else if (wpOption !== undefined) {
        newTheme = (await theme.setWallpaper(wpGallery[wpOption])) as ThemeType;
      } else {
        console.warn('wallpaper was undefined.');
        return;
      }
      await updateSpaceTheme(newTheme);
    },
  });

  const customWallpaper = useField({
    id: 'customWallpaper',
    form: themeForm,
    initialValue: '',
    validate: (pape: string) => {
      if (pape === '') {
        return { error: undefined, parsed: pape };
      }
      if (
        pape.match(
          /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/
        )
      ) {
        setWpOption(undefined);
        return { error: undefined, parsed: pape };
      }

      return { error: 'Invalid URL', parsed: undefined };
    },
  });

  return (
    <SettingPane>
      <SettingTitle title="Theme" />
      <SettingSection
        title="Wallpaper"
        body={
          <>
            <SettingControl label="Current">
              <WallpaperPreview src={theme.wallpaper} />
            </SettingControl>
            <RadioGroup
              options={[
                { label: 'Gallery', value: 'gallery' },
                { label: 'Custom url', value: 'custom' },
              ]}
              selected={wallpaperOption}
              onClick={(val: string) => {
                theme.setWallpaper(val);
                setWallpaperOption(val);
              }}
            />
            {wallpaperOption === 'gallery' && (
              <SettingControl>
                <RadioImages
                  style={{
                    backgroundColor: 'rgba(var(--rlm-overlay-hover-rgba))',
                  }}
                  selected={wpOption}
                  options={Object.keys(wpGallery).map((key) => ({
                    imageSrc: wpGallery[key],
                    value: key,
                  }))}
                  onClick={async (value: wpOptionType) => {
                    if (wpOption && value === wpOption) {
                      setWpOption(undefined);
                    } else if (value) {
                      setWpOption(value);
                      const newTheme = await theme.setWallpaper(
                        wpGallery[value]
                      );
                      const currentSpace = spacesStore.spaces.get(space.path);
                      if (!currentSpace) {
                        console.warn('space not found in spacesStore');
                        return;
                      }
                      await currentSpace.setTheme(newTheme);
                    }
                  }}
                />
              </SettingControl>
            )}
            {wallpaperOption === 'custom' && (
              <SettingControl>
                <TextInput
                  id="customWallpaper"
                  name="customWallpaper"
                  type="text"
                  placeholder="Paste url here"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(var(--rlm-overlay-hover-rgba))',
                  }}
                  inputStyle={{
                    background: 'transparent',
                  }}
                  defaultValue={customWallpaper.state.value}
                  // error={!shipUrl.computed.isDirty || shipUrl.computed.error}
                  onChange={(e) =>
                    customWallpaper.actions.onChange(
                      (e.target as HTMLInputElement).value
                    )
                  }
                  rightAdornment={
                    canEditSpace ? (
                      <Box>
                        <Button.TextButton
                          style={{ fontWeight: 400 }}
                          disabled={
                            !themeForm.computed.isValid || !canEditSpace
                          }
                          onClick={themeForm.actions.submit}
                        >
                          Save
                        </Button.TextButton>
                      </Box>
                    ) : undefined
                  }
                />
              </SettingControl>
            )}
          </>
        }
      />
    </SettingPane>
  );
};

const ThemePanelPresenter = () => {
  const { loggedInAccount } = useAppState();
  const { spacesStore } = useShipStore();

  if (!spacesStore.selected || !loggedInAccount) return null;

  return (
    <ThemePanelPresenterView
      account={loggedInAccount}
      space={spacesStore.selected}
    />
  );
};

export const ThemePanel = observer(ThemePanelPresenter);
