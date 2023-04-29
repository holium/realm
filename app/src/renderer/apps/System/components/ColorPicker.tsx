import { useEffect, useRef, useState } from 'react';
import { TwitterPicker } from 'react-color';

import { Flex, useToggle } from '@holium/design-system';

import { ColorTile, ColorTilePopover } from 'renderer/components/ColorTile';

// TODO a lot of this is taken from Spaces/Workflow/Details.tsx
// there should probably be a generic shared component

const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const isValidHexColor = (hex: string) => {
  return hexRegex.test(`${hex}`);
};

export interface ColorPickerProps {
  top?: number;
  left?: number;
  initialColor: string;
  swatches: string[];
  onChange: (color: string) => void;
}

export const ColorPicker = ({
  top = 40,
  left = -6,
  initialColor,
  swatches,
  onChange,
}: ColorPickerProps) => {
  const colorPickerRef = useRef(null);

  const open = useToggle(false);

  const [validatedColor, setValidatedColor] = useState(initialColor);

  useEffect(() => {
    onChange(validatedColor);
  }, [validatedColor]);

  useEffect(() => {
    // Click outside should close the popover.
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !(colorPickerRef.current as any).contains(event.target)
      ) {
        open.toggleOff();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Flex position="relative">
      <ColorTile size={26} tileColor={validatedColor} onClick={open.toggle} />
      <ColorTilePopover
        size={26}
        ref={colorPickerRef}
        isOpen={open.isOn}
        top={top}
        left={left}
      >
        <TwitterPicker
          width="inherit"
          styles={{
            default: {
              card: {
                backgroundColor: 'rgba(var(--rlm-window-rgba))',
                boxShadow: 'var(--rlm-box-shadow-3)',
                borderRadius: '9px',
                border: '1px solid rgba(var(--rlm-border-rgba))',
              },
              input: {
                backgroundColor: 'rgba(var(--rlm-input-rgba))',
                borderColor: 'rgba(var(--rlm-text-rgba))',
                color: 'rgba(var(--rlm-text-rgba))',
                height: '30px',
              },
              hash: {
                backgroundColor: 'rgba(var(--rlm-text-rgba))',
                color: 'rgba(var(--rlm-input-rgba))',
              },
            },
          }}
          color={validatedColor}
          onChange={(newColor: { hex: string }) => {
            if (isValidHexColor(newColor.hex)) {
              setValidatedColor(newColor.hex);
            }
          }}
          triangle="hide"
          colors={swatches}
        />
      </ColorTilePopover>
    </Flex>
  );
};
