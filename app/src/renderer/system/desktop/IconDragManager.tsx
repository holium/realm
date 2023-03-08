import { Flex, Icon } from '@holium/design-system';
import { IconPathsType } from '@holium/design-system/src/general/Icon/icons';
import React, { useMemo, useState } from 'react';

const ICON_MAP: Record<string, IconPathsType> = {
  agent: 'Airlift',
  gate: 'Gate',
  button: 'Button',
  textinput: 'TextInput',
  slider: 'Slider',
  colorpicker: 'ColorPicker',
  text: 'Text',
  image: 'Image',
  link: 'Link',
  audio: 'Audio',
  media: 'Media',
  '3d': 'Icon3D',
  uqbar: 'Uqbar',
  portal: 'HoliumOpaque',
  wallet: 'WalletTray',
  relic: 'AppIconCompassNoGradient',
  room: 'Room',
  toggle: 'Toggle',
};

const ICON_SIZE = 28;
const DIV_SIZE = 33;

const ICON_SIZES: Record<string, number> = {
  agent: ICON_SIZE,
  gate: ICON_SIZE - 10,
  button: ICON_SIZE - 3,
  toggle: ICON_SIZE - 4,
  textinput: ICON_SIZE - 5,
  slider: ICON_SIZE - 3,
  colorpicker: ICON_SIZE - 10,
  text: ICON_SIZE,
  image: ICON_SIZE,
  link: ICON_SIZE,
  audio: ICON_SIZE - 3,
  media: ICON_SIZE,
  '3d': ICON_SIZE - 3,
  uqbar: ICON_SIZE - 7,
  portal: ICON_SIZE - 3,
  wallet: ICON_SIZE,
  relic: ICON_SIZE,
  room: ICON_SIZE - 2,
};

export const IconDragManager = () => {
  const [draggedItem, setDraggedItem] = useState<string | undefined>(undefined);
  const [draggedItemPosition, setDraggedItemPosition] = useState({
    x: 0,
    y: 0,
  });

  const handleDrag = (event: any) => {
    setDraggedItemPosition({
      x: event.clientX - DIV_SIZE / 2,
      y: event.clientY - DIV_SIZE / 2,
    });
  };

  const handleDrop = () => {
    setDraggedItem(undefined);
  };

  const handleDragStart = (event: any) => {
    setDraggedItemPosition({
      x: event.clientX - DIV_SIZE / 2,
      y: event.clientY - DIV_SIZE / 2,
    });
    setDraggedItem(event.dataTransfer.getData('text/plain'));
  };

  const draggedIcon: IconPathsType | undefined = useMemo(
    () => draggedItem && ICON_MAP[draggedItem],
    [draggedItem]
  );
  const iconSize = useMemo(
    () => draggedItem && ICON_SIZES[draggedItem],
    [draggedItem]
  );

  return (
    <div
      id="icon-drag-manager"
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDrop={handleDrop}
    >
      {draggedIcon && (
        <Flex
          style={{
            position: 'fixed',
            top: draggedItemPosition.y,
            left: draggedItemPosition.x,
            zIndex: 16,
          }}
          size={DIV_SIZE}
          justifyContent="center"
          alignItems="center"
        >
          <Icon name={draggedIcon} size={iconSize} overflow="visible" />
        </Flex>
      )}
    </div>
  );
};
