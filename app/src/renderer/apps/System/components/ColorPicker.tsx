import React, { FC, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { ColorTile, ColorTilePopover } from 'renderer/components/ColorTile';
import { TwitterPicker } from 'react-color';

// TODO a lot of this is taken from Spaces/Workflow/Details.tsx
// there should probably be a generic shared component

const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const isValidHexColor = (hex: string) => {
  return hexRegex.test(`${hex}`);
};

export interface ColorPickerProps {
  initialColor: string;
  swatches: string[];
  onChange: (color: string) => void;
}

export const ColorPicker: FC<ColorPickerProps> = observer(
  (props: ColorPickerProps) => {
    const colorPickerRef = useRef(null);

    // const { desktop, ship, contacts } = useServices();
    // const { inputColor, accentColor } = theme.currentTheme;

    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [validatedColor, setValidatedColor] = useState(props.initialColor);

    useEffect(() => {
      // TODO propogate to parent
      props.onChange(validatedColor);
      // console.log("NEW VALID COLOR")
    }, [validatedColor]);

    return (
      <Flex position="relative">
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
          ref={colorPickerRef}
          isOpen={colorPickerOpen}
          data-is-open={colorPickerOpen}
        >
          <TwitterPicker
            width="inherit"
            className="cursor-style"
            color={validatedColor}
            onChange={(newColor: { hex: string }) => {
              // color.actions.onChange(newColor.hex);
              // setWorkspaceState({
              //     color: newColor.hex,
              // });
              if (isValidHexColor(newColor.hex)) {
                setValidatedColor(newColor.hex);
              }
            }}
            triangle="top-left"
            colors={props.swatches}
            // colors={[
            // '#4E9EFD',
            // '#FFFF00',
            // '#00FF00',
            // '#FF0000',
            // '#52B278',
            // '#D9682A',
            // '#ff3399',
            // '#8419D9',
            // ]}
          />
        </ColorTilePopover>
      </Flex>
    );
  }
);
