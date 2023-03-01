import { FC } from 'react';
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

  const onButtonDragStart = (event: Event, nodeType: string) => {
    const onButtonDragEnd = (event: any) => {
      event.preventDefault();
      const iconEvent = new CustomEvent('icon', {
        detail: null,
      });
      window.dispatchEvent(iconEvent);
      window.removeEventListener('mouseup', onButtonDragEnd);
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('application/reactflow', nodeType);
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
      });
      Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
      document.getElementById('airlift-manager')!.dispatchEvent(dropEvent);
    };
    // window.onmouseup = (event) => onButtonDragEnd(event, nodeType);
    window.addEventListener('mouseup', onButtonDragEnd);
    const iconEvent = new CustomEvent('icon', {
      detail: 'Airlift',
    });
    window.dispatchEvent(iconEvent);
    event.preventDefault();
  };

  return (
    <Flex flexDirection="column" gap="15">
      <Flex flexDirection="row" justifyContent="space-around">
        <Flex flexDirection="column" gap={20} flexGrow={1}>
          <Text>Inputs</Text>
          <IconButton
            size={ICON_SIZE - 3}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'button')}
            color={textColor}
            height="10px"
          >
            <Icon name="Button" size={ICON_SIZE} overflow="visible" />
          </IconButton>
          <IconButton
            size={ICON_SIZE - 3}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'textinput')}
            color={textColor}
          >
            <Icon name="TextInput" size={ICON_SIZE} overflow="visible" />
          </IconButton>
          <IconButton
            size={ICON_SIZE - 3}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'textinput')}
            color={textColor}
          >
            <Icon name="Slider" size={ICON_SIZE} overflow="visible" />
          </IconButton>
        </Flex>
        <Flex flexDirection="column" gap={10} flexGrow={1}>
          <Text>Widgets</Text>
          <IconButton
            size={ICON_SIZE}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'text')}
            color={textColor}
          >
            <Icon name="Text" size={ICON_SIZE} />
          </IconButton>
          <IconButton
            size={ICON_SIZE}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'image')}
            color={textColor}
          >
            <Icon name="Image" size={ICON_SIZE} />
          </IconButton>
          <IconButton
            size={ICON_SIZE}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'link')}
            color={textColor}
          >
            <Icon name="Link" size={ICON_SIZE} />
          </IconButton>
          <IconButton
            size={ICON_SIZE - 3}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'audio')}
            color={textColor}
          >
            <Icon name="Audio" size={ICON_SIZE - 5} overflow="visible" ml={1} />
          </IconButton>
          <IconButton
            size={ICON_SIZE - 3}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'audio')}
            color={textColor}
          >
            <Icon name="Media" size={ICON_SIZE - 5} overflow="visible" ml={1} />
          </IconButton>
          <IconButton
            size={ICON_SIZE - 3}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, '3d')}
          >
            <Icon name="Icon3D" size={ICON_SIZE} fill="none" stroke="black" />
          </IconButton>
        </Flex>
        <Flex flexDirection="column" gap={10} flexGrow={1}>
          <Text>Code</Text>
          <IconButton
            size={ICON_SIZE}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'agent')}
            color={textColor}
          >
            <Icon name="Airlift" />
          </IconButton>
          <IconButton
            size={ICON_SIZE - 7}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'gate')}
            color={textColor}
          >
            <Icon name="Gate" overflow="visible" />
          </IconButton>
          <IconButton
            size={ICON_SIZE - 3}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'uqbar')}
            color={textColor}
          >
            <Icon name="Uqbar" size={ICON_SIZE} overflow="visible" />
          </IconButton>
          <IconButton
            size={ICON_SIZE - 3}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'uqbar')}
            color={textColor}
          >
            <Icon name="Uqbar2" size={ICON_SIZE} overflow="visible" />
          </IconButton>
        </Flex>
        <Flex flexDirection="column" gap={10} flexGrow={1} ml={4}>
          <Text>Realm Primitives</Text>
          <IconButton
            size={ICON_SIZE - 3}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'portal')}
            color={textColor}
          >
            <Icon name="Holium" size={ICON_SIZE} filter={'grayscale(100%)'} />
          </IconButton>
          <IconButton
            size={ICON_SIZE}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'wallet')}
            color={textColor}
          >
            <Icon name="WalletTray" size={ICON_SIZE} />
          </IconButton>
          <IconButton
            size={ICON_SIZE + 2}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'relic')}
            color={textColor}
          >
            <Icon
              name="AppIconCompassNoGradient"
              size={ICON_SIZE}
              filter={'grayscale(100%) brightness(65%) contrast(500%)'}
            />
          </IconButton>
          <IconButton
            size={ICON_SIZE}
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'rooms')}
            color={textColor}
            ml={1}
          >
            <Icon name="Room" size={ICON_SIZE} overflow="visible" />
          </IconButton>
        </Flex>
      </Flex>
      <Flex gap={8} flex={1} justifyContent="flex-end">
        <Text fontSize={1} mb={3}>
          To drop an Airlift, drag an icon from the Command Palette into the
          current Space.
        </Text>
      </Flex>
    </Flex>
  );
});
