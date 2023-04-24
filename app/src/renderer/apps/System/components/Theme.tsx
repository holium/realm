import { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { lighten } from 'polished';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useField, useForm } from 'mobx-easy-form';
import {
  Flex,
  RadioImages,
  Text,
  Card,
  Button,
  TextInput,
  Box,
} from '@holium/design-system';
import { useAppState } from 'renderer/stores/app.store';
import { ShipMobxType, useShipStore } from 'renderer/stores/ship.store';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import { ThemeType } from 'renderer/stores/models/theme.model';

const WallpaperPreview = styled(motion.img)`
  width: 80%;
  height: 'auto';
  margin: 0 auto;
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
  theme: ThemeType;
  ship: ShipMobxType;
  space: SpaceModelType;
};

const ThemePanelPresenterView = ({
  theme,
  ship,
  space,
}: ThemePanelPresenterViewProps) => {
  const { spacesStore } = useShipStore();
  const { windowColor, inputColor } = theme;
  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);
  const [wpOption, setWpOption] = useState<wpOptionType>(undefined);
  const wpGalleryKeys = Object.keys(wpGallery);

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
    <Flex
      gap={12}
      flexDirection="column"
      p={3}
      width="100%"
      height="100%"
      overflowY="auto"
    >
      <Flex flexDirection="row" justifyContent={'space-between'} mb={0}>
        <Text.Custom fontSize={7} fontWeight={600}>
          Theme
        </Text.Custom>
        {canEditSpace && (
          <Box>
            <Button.TextButton
              style={{ fontWeight: 400 }}
              disabled={!themeForm.computed.isValid || !canEditSpace}
              onClick={themeForm.actions.submit}
            >
              Save
            </Button.TextButton>
          </Box>
        )}
      </Flex>

      {/* <Text opacity={0.7} fontSize={3} fontWeight={500}>
        COLORS
      </Text>
      <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
      >
        <Flex flexDirection='row'  gap={18} mb={18}>

        <Text my='auto' fontWeight={500} >
          Appearance
        </Text>

        <Flex>
            <RadioGroup
                selected={appearance}
                options={[
                  { label: 'Dynamic', value: 'dynamic' },
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                ]}
                onClick={(value: AppearanceType) => {
                  setAppearance(value);
                }}
              />
          </Flex>

        </Flex>

        <Flex gap={18}>
          <Text my='auto' fontWeight={500} >
            Accent Color
          </Text>

          <Flex position="relative" justifyContent="flex-end">
              <ColorTile
              // id="space-color-tile"
              size={26}
              tileColor={validatedColor}
              onClick={(_evt: any) => {
                  setColorPickerOpen(!colorPickerOpen);
              }}
              />
              <ColorTilePopover
              // id="space-color-tile-popover"
              size={26}
              isOpen={colorPickerOpen}
              data-is-open={colorPickerOpen}
              >
              <TwitterPicker
                  width="inherit"
                  className="cursor-style"
                  color={validatedColor}
                  onChange={(newColor: { hex: string }) => {
                  accentColorField.actions.onChange(newColor.hex);
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

        </Flex>

      </Card> */}

      {/* <Text
        opacity={0.7}
        fontSize={3}
        fontWeight={500}>
        WALLPAPER
      </Text> */}

      <Card
        p="20px"
        width="100%"
        customBg={cardColor}
        elevation={1}
        flexDirection={'column'}
      >
        <Text.Custom mb={4} fontWeight={500}>
          Current
        </Text.Custom>
        <WallpaperPreview src={theme.wallpaper} />
        <Text.Custom mt={4} mb={2} fontWeight={500}>
          Gallery
        </Text.Custom>
        <RadioImages
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
        <Text.Custom mt={4} mb={2} fontWeight={500}>
          Custom
        </Text.Custom>
        <TextInput
          id="customWallpaper"
          name="customWallpaper"
          type="text"
          placeholder="Paste url here"
          style={{
            borderRadius: 9,
            backgroundColor: inputColor,
          }}
          defaultValue={customWallpaper.state.value}
          // error={!shipUrl.computed.isDirty || shipUrl.computed.error}
          onChange={(e: any) =>
            customWallpaper.actions.onChange(e.target.value)
          }
        />
      </Card>
    </Flex>
  );
};

const ThemePanelPresenter = () => {
  const { theme } = useAppState();
  const { ship, spacesStore } = useShipStore();

  if (!spacesStore.selected || !ship) return null;

  return (
    <ThemePanelPresenterView
      theme={theme}
      ship={ship}
      space={spacesStore.selected}
    />
  );
};

export const ThemePanel = observer(ThemePanelPresenter);
