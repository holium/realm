import { useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useField, useForm } from 'mobx-easy-form';
import {
  RadioImages,
  TextInput,
  RadioGroup,
  Box,
  Button,
} from '@holium/design-system';
import { useAppState } from 'renderer/stores/app.store';
import { ShipMobxType, useShipStore } from 'renderer/stores/ship.store';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import { ThemeType } from 'renderer/stores/models/theme.model';
import { SettingTitle } from '../components/SettingTitle';
import { SettingSection } from '../components/SettingSection';
import { SettingControl } from '../components/SettingControl';
import { SettingPane } from '../components/SettingPane';
// import { ColorTile, ColorTilePopover } from 'renderer/components/ColorTile';
// import TwitterPicker from 'react-color/lib/components/twitter/Twitter';

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
  ship: ShipMobxType;
  space: SpaceModelType;
};

const ThemePanelPresenterView = ({
  ship,
  space,
}: ThemePanelPresenterViewProps) => {
  const { theme } = useAppState();
  const { spacesStore } = useShipStore();
  const [wpOption, setWpOption] = useState<wpOptionType>(undefined);
  const wpGalleryKeys = Object.keys(wpGallery);
  const [wallpaperOption, setWallpaperOption] = useState<string>('gallery');

  const members = space.members.list;
  const me = members.find(
    (member) =>
      member.patp === ship.patp && member.roles.indexOf('admin') !== -1
  );
  // is 'me' (currently logged in user) an admin?
  const canEditSpace = me !== undefined;

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

      let newTheme: ThemeType | undefined;
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
      {/* <SettingSection>
        <SettingControl inline label="Accent Color">
          <Flex position="relative" justifyContent="flex-end">
            <ColorTile
              // id="space-color-tile"
              size={26}
              tileColor={'#000'}
              onClick={(_evt: any) => {
                // setColorPickerOpen(!colorPickerOpen);
              }}
            />
            <ColorTilePopover
              // id="space-color-tile-popover"
              size={26}
              // isOpen={colorPickerOpen}
              // data-is-open={colorPickerOpen}
            >
              <TwitterPicker
                width="inherit"
                className="cursor-style"
                // color={validatedColor}
                onChange={(newColor: { hex: string }) => {
                  // accentColorField.actions.onChange(newColor.hex);
                  // setWorkspaceState({
                  //     color: newColor.hex,
                  // });
                  // setValidatedColor(newColor.hex);
                }}
                triangle="top-left"
                colors={[
                  '#4E9EFD',
                  '#FFFF00',
                  '#00FF00',
                  '#FF0000',
                  '#52B278',
                  '#D9682A',
                  '#ff3399',
                  '#8419D9',
                ]}
              />
            </ColorTilePopover>
          </Flex>
        </SettingControl>
      </SettingSection> */}
      <SettingSection title="Wallpaper">
        <SettingControl label="Current">
          <WallpaperPreview src={theme.wallpaper} />
        </SettingControl>
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
            <RadioImages
              style={{ backgroundColor: 'rgba(var(--rlm-overlay-hover-rgba))' }}
              selected={wpOption}
              options={wpGalleryKeys.map((key: string) => ({
                imageSrc: wpGallery[key],
                value: key,
              }))}
              onClick={async (value: wpOptionType) => {
                if (wpOption && value === wpOption) {
                  setWpOption(undefined);
                } else if (value) {
                  setWpOption(value);
                  const newTheme = await theme.setWallpaper(wpGallery[value]);
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
                // borderRadius: 9,
                backgroundColor: 'rgba(var(--rlm-overlay-hover-rgba))',
              }}
              inputStyle={{
                background: 'transparent',
              }}
              defaultValue={customWallpaper.state.value}
              // error={!shipUrl.computed.isDirty || shipUrl.computed.error}
              onChange={(e: any) =>
                customWallpaper.actions.onChange(e.target.value)
              }
              rightAdornment={
                canEditSpace ? (
                  <Box>
                    <Button.TextButton
                      style={{ fontWeight: 400 }}
                      disabled={!themeForm.computed.isValid || !canEditSpace}
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
      </SettingSection>
    </SettingPane>
  );
};

const ThemePanelPresenter = () => {
  const { ship, spacesStore } = useShipStore();

  if (!spacesStore.selected || !ship) return null;

  return <ThemePanelPresenterView ship={ship} space={spacesStore.selected} />;
};

export const ThemePanel = observer(ThemePanelPresenter);
