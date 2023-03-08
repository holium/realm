import { FC } from 'react';
import { Flex, Text, Icon, Button } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { observer } from 'mobx-react';

const ICON_SIZE = 28;

export const AirliftCommandPalette: FC = observer(() => {
  // const { dimensions } = props;
  const { theme } = useServices();
  const { textColor } = theme.currentTheme;

  const onButtonDragStart = (event: any, nodeType: string) => {
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
        <Flex
          flexDirection="column"
          gap={10}
          flexGrow={1}
          alignItems="flex-start"
        >
          <Text.Custom>Inputs</Text.Custom>
          <Button.IconButton
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'button')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="Button" overflow="visible" size={ICON_SIZE - 3} />
          </Button.IconButton>
          <Button.IconButton
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'textinput')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="TextInput" overflow="visible" size={ICON_SIZE - 5} />
          </Button.IconButton>
          <Button.IconButton
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'slider')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon
              mt={4}
              name="Slider"
              overflow="visible"
              size={ICON_SIZE - 3}
            />
          </Button.IconButton>
          <Button.IconButton
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'colorpicker')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="ColorPicker" overflow="visible" size={ICON_SIZE - 10} />
          </Button.IconButton>
        </Flex>
        <Flex flexDirection="column" gap={10} flexGrow={1}>
          <Text.Custom>Widgets</Text.Custom>
          <Button.IconButton
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'text')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="Text" size={ICON_SIZE} />
          </Button.IconButton>
          <Button.IconButton
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'image')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="Image" size={ICON_SIZE} />
          </Button.IconButton>
          <Button.IconButton
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'link')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="Link" size={ICON_SIZE} />
          </Button.IconButton>
          <Button.IconButton
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'audio')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="Audio" size={ICON_SIZE - 3} overflow="visible" ml={1} />
          </Button.IconButton>
          <Button.IconButton
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'media')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="Media" size={ICON_SIZE - 3} overflow="visible" ml={1} />
          </Button.IconButton>
          <Button.IconButton
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, '3d')}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon
              name="Icon3D"
              size={ICON_SIZE - 3}
              fill="none"
              stroke="black"
            />
          </Button.IconButton>
        </Flex>
        <Flex flexDirection="column" gap={10} flexGrow={1}>
          <Text.Custom>Code</Text.Custom>
          <Button.IconButton
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'agent')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="Airlift" size={ICON_SIZE} />
          </Button.IconButton>
          <Button.IconButton
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'gate')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="Gate" overflow="visible" size={ICON_SIZE - 10} mr={2} />
          </Button.IconButton>
          <Button.IconButton
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'uqbar')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="Uqbar" size={ICON_SIZE - 7} overflow="visible" mr={1} />
          </Button.IconButton>
        </Flex>
        <Flex flexDirection="column" gap={10} flexGrow={1} ml={4}>
          <Text.Custom>Realm Primitives</Text.Custom>
          <Button.IconButton
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'portal')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="HoliumOpaque" size={ICON_SIZE - 3} />
          </Button.IconButton>
          <Button.IconButton
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'wallet')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="WalletTray" size={ICON_SIZE} />
          </Button.IconButton>
          <Button.IconButton
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'relic')}
            customColor={textColor}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon
              name="AppIconCompassNoGradient"
              size={ICON_SIZE}
              filter={'grayscale(100%) brightness(65%) contrast(500%)'}
            />
          </Button.IconButton>
          <Button.IconButton
            mt="2px"
            draggable={true}
            onDragStart={(event) => onButtonDragStart(event, 'room')}
            customColor={textColor}
            ml={1}
            justifyContent="center"
            alignItems="center"
            size={ICON_SIZE + 5}
          >
            <Icon name="Room" size={ICON_SIZE - 2} overflow="visible" />
          </Button.IconButton>
        </Flex>
      </Flex>
      <Flex gap={8} flex={1} justifyContent="flex-end">
        <Text.Custom fontSize={1} mt={3} mb={3}>
          To drop an Airlift, drag an icon from the Command Palette into the
          current space.
        </Text.Custom>
      </Flex>
    </Flex>
  );
});
