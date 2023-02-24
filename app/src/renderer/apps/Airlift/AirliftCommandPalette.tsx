import { FC, useCallback } from 'react';
import { Flex, IconButton, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { observer } from 'mobx-react';
import { Icon } from '@holium/design-system';

const ICON_SIZE = 28;

export const AirliftCommandPalette: FC = observer(() => {
  // const { dimensions } = props;
  const { theme, spaces } = useServices();
  const { windowColor } = theme.currentTheme;
  const { textColor } = theme.currentTheme;

  const onButtonDragStart = (event: DragEvent, nodeType) => {
    window.addEventListener('mouseup', onButtonDragEnd);
    const iconEvent = new CustomEvent('icon', {
      detail: 'Airlift',
    });
    window.dispatchEvent(iconEvent);
    event.preventDefault();
  };

  const onButtonDragEnd = useCallback(
    (event: any) => {
      event.preventDefault();
      const iconEvent = new CustomEvent('icon', {
        detail: null,
      });
      window.dispatchEvent(iconEvent);
      window.removeEventListener('mouseup', onButtonDragEnd);
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('application/reactflow', 'agent');
      let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      console.log(elemBelow);
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
      });
      Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
      document.getElementById('airlift-manager')!.dispatchEvent(dropEvent);
    },
    []
    /*[activeApp, anchorOffset, position, dimensions]*/
  );

  return (
    <Flex flexDirection="column" gap="15">
      <Flex flexDirection="row" justifyContent="space-around">
        <Flex flexGrow={1}>
          <Text>Inputs</Text>
        </Flex>
        <Flex flexGrow={1}>
          <Text>Outputs</Text>
        </Flex>
        <Flex flexDirection="column" gap={10} flexGrow={1}>
          <Text>Code</Text>
          <IconButton
            id="airlift-tray-icon"
            size={ICON_SIZE}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'agent')}
            color={textColor}
            // mb="-2px"
          >
            <Icon name="Airlift" />
          </IconButton>
        </Flex>
        <Flex flexDirection="column" gap={10} flexGrow={1}>
          <Text>Realm Primitives</Text>
          <IconButton
            id="airlift-tray-icon"
            size={ICON_SIZE}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'agent')}
            color={textColor}
            // mb="-2px"
          >
            <Icon name="Wallet" size={ICON_SIZE} />
          </IconButton>
          <Icon name="QRCode" size={ICON_SIZE} />
        </Flex>
      </Flex>
      <Flex
        // style={{ marginTop: 54, maxHeight: '100%' }}
        gap={8}
        flex={1}
        overflowY={'scroll'}
      >
        <Text fontSize={1}>
          To drop an Airlift, drag an icon from the Command Palette into the
          current Space.
        </Text>
      </Flex>
    </Flex>
  );
});
