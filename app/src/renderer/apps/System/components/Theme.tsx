import React, { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Card, RadioImages, TextButton, RadioGroup, Input} from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { lighten } from 'polished';
import { ColorPicker } from './ColorPicker';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useField, useForm } from 'mobx-easy-form';
import { ColorTile, ColorTilePopover } from 'renderer/components/ColorTile';
import { TwitterPicker } from 'react-color';
import { DesktopActions } from 'renderer/logic/actions/desktop';


const WallpaperPreview = styled(motion.img)`
  width:250px;
  height:'auto';
  border-radius: 6px;
  transition: all 0.25s ease;
  draggable: false;
  -webkit-user-drag: none;
`;

export const ThemePanel: FC<any> = observer(() => {

  const { desktop, ship, contacts } = useServices();
  const { windowColor, textColor, accentColor, inputColor } = desktop.theme;

  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);
  
  type AppearanceType = 'dynamic' | 'light' | 'dark';

  const [appearance, setAppearance] =
  useState<AppearanceType>('dynamic');
  

  type wpOptionType = 'blueorb' | 'darkneon' | 'hallway' | 'sunorb' | 'jiggleorb' | 'sliceball' | undefined;

  const wpGallery = {
    'blueorb' : 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2574&q=80',
    'darkneon' : 'https://images.unsplash.com/photo-1650943574955-ac02c65cfc71?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2942&q=80',
    'hallway' : 'https://images.unsplash.com/photo-1622798023168-76a8f3b1f24e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3864&q=80',
    'sunorb'    : 'https://images.unsplash.com/photo-1636408807362-a6195d3dd4de?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3264&q=80',
    'jiggleorb' : 'https://images.unsplash.com/photo-1633783156075-a01661455344?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3264&q=80',
    'sliceball' : 'https://images.unsplash.com/photo-1627037558426-c2d07beda3af?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3075&q=80 ',
  }

  const [wpOption, setWpOption] =
  useState<wpOptionType>(undefined);

  const themeForm = useForm({
    async onSubmit({ values }: any) {

      //
      if(values.customWallpaper !== '') {
        await DesktopActions.changeWallpaper(`/${ship!.patp!}/our`, values.customWallpaper)

      }
      else if(wpOption !== undefined) {
        await DesktopActions.changeWallpaper(`/${ship!.patp!}/our`, wpGallery[wpOption])
      }
      // await OnboardingActions.addShip(values);

      // props.setState &&
      //   props.setState({ ...props.workflowState, ship: values });
      // props.onNext && props.onNext(values);
    },
  });


  const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  const isValidHexColor = (hex: string) => {
    return hexRegex.test(hex);
  };
  // // // //
  const accentColorField = useField({
    id: 'accentColor',
    form: themeForm,
    initialValue: accentColor,
    validate: (acc: string) => {

      if (isValidHexColor(acc)) {
        setValidatedColor(acc);
        return { error: undefined, parsed: acc };
      }

      return { error: 'Invalid Color', parsed: undefined };
    },  });

    const customWallpaper = useField({
      id: 'customWallpaper',
      form: themeForm,
      initialValue: '',
      validate: (pape: string) => {
  
        if(pape === '') {
          return { error: undefined, parsed: pape };
        }
        if(pape.match(
          /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/
        )) {
          setWpOption(undefined);
          return { error: undefined, parsed: pape };
        }
  
        return { error: 'Invalid URL', parsed: undefined };
      },  });


  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [validatedColor, setValidatedColor] = useState(accentColor);


  return (

    <Flex gap={12} flexDirection="column" p="12px" width='100%'>

      <Flex 
        flexDirection='row'
        justifyContent={'space-between'}
        mb={6}
        >
        <Text
          fontSize={8}
          fontWeight={600}
        >
          Theme
        </Text>

          <TextButton
            style={{ fontWeight: 400 }}
            showBackground
            textColor={accentColor}
            highlightColor={accentColor}
            disabled={!themeForm.computed.isValid}
            onClick={themeForm.actions.submit}
            >
                Save
          </TextButton>
      </Flex>
      
      <Text opacity={0.7} fontSize={3} fontWeight={500}>
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
            {/* menu / list  */}
            <RadioGroup
                customBg={windowColor}
                textColor={textColor}
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
          
          {/* <ColorPicker /> */}
          
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
        
      </Card>
      
      <Text
        mt={2}
        opacity={0.7}
        fontSize={3}
        fontWeight={500}>
        WALLPAPER
      </Text>
      <Card
        p="20px"
        width="100%"
        customBg={cardColor}
        flexDirection={'column'}
      >

        <Text mb={4} fontWeight={500}>
          Current
        </Text>

        <WallpaperPreview
        src={desktop.theme.wallpaper}
         />

        <Text mt={6} mb={2} fontWeight={500}>
          Gallery
        </Text>

           <RadioImages
          customBg={windowColor}
          accentColor={accentColor}
          selected={wpOption}
          options={[
            {
              imageSrc: wpGallery['blueorb'],
              value: 'blueorb',
            },
           
            {
              imageSrc: wpGallery['hallway'],
              value: 'hallway',
            },
            {
              imageSrc: wpGallery['sunorb'],
              value: 'sunorb',
            },
            {
              imageSrc: wpGallery['darkneon'],
              value: 'darkneon',
            },
            {
              imageSrc: wpGallery['jiggleorb'],
              value: 'jiggleorb',
            },
            {
              imageSrc: wpGallery['sliceball'],
              value: 'sliceball',
            },
          ]}
          onClick={(value: wpOptionType) => {

            if (wpOption && value === wpOption) {
              setWpOption(undefined);
            } else {
              setWpOption(value);
            }

          } }
          />


        <Text my={4} fontWeight={500}>
          Custom
        </Text>
        <Input
            className="realm-cursor-text-cursor"
            type="text"
            placeholder="Paste url here"
            wrapperStyle={{
              cursor: 'none',
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

  )
})