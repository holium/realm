import { ChangeEvent, useEffect, useRef } from 'react';
import { TwitterPicker } from 'react-color';

import { Flex, isValidHexColor, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { ColorTile, ColorTilePopover } from 'renderer/components/ColorTile';

import { spaceColorOptions } from './types';

type Props = {
  color: string;
  setColor: (color: string) => void;
  onValidChange: (value: string) => void;
};

export const EditSpaceColor = ({ color, setColor, onValidChange }: Props) => {
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const colorPicker = useToggle(false);
  const colorError = useToggle(false);

  const onChangeSpaceColorPicker = (color: { hex: string }) => {
    const newColor = color.hex.replace('#', '');
    const colorWithHash = `#${newColor}`;

    setColor(newColor);
    onValidChange(colorWithHash);

    colorPicker.toggleOff();
  };

  const onChangeSpaceColorInput = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement | null;
    if (!input) return;

    const color = input.value;
    const colorWithHash = `#${color}`;

    setColor(color);

    if (isValidHexColor(colorWithHash)) {
      onValidChange(colorWithHash);
      colorError.toggleOff();
    } else {
      colorError.toggleOn();
    }
  };

  useEffect(() => {
    // Close the color picker if the user clicks outside of it.
    const handleClickOutside = (event: MouseEvent) => {
      const clickedEl = event.target as HTMLElement;

      if (clickedEl && !colorPickerRef.current?.contains(clickedEl)) {
        colorPicker.toggleOff();
      }
    };

    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  return (
    <TextInput
      id="space-color"
      name="color"
      height={34}
      required
      leftAdornment={<Text.Custom opacity={0.5}>#</Text.Custom>}
      rightAdornment={
        <Flex
          position="relative"
          justifyContent="flex-end"
          onClick={(e) => e.stopPropagation()}
        >
          <ColorTile
            id="space-color-tile"
            size={26}
            tileColor={`#${color}`}
            onClick={colorPicker.toggle}
          />
          <ColorTilePopover
            id="space-color-tile-popover"
            size={26}
            top={146}
            left={198}
            ref={colorPickerRef}
            isOpen={colorPicker.isOn}
          >
            <TwitterPicker
              width="inherit"
              className="cursor-style"
              color={`#${color}`}
              onChange={onChangeSpaceColorPicker}
              triangle="top-left"
              colors={spaceColorOptions}
            />
          </ColorTilePopover>
        </Flex>
      }
      inputStyle={{
        width: 80,
      }}
      style={{
        borderRadius: 6,
        paddingRight: 0,
      }}
      value={color}
      error={colorError.isOn}
      onChange={onChangeSpaceColorInput}
    />
  );
};
