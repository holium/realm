import { useCallback } from 'react';
import { observer } from 'mobx-react';
import { Badge, Flex } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { Icon, BarButton } from '@holium/design-system';
import { AppRegistry } from 'renderer/apps/registry';

const MessagesTrayPresenter = () => {
  const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
    useTrayApps();

  const { icon, iconSize, position, anchorOffset, dimensions } =
    AppRegistry['chat'];

  const onButtonClick = useCallback(
    (evt: any) => {
      evt.stopPropagation();
      if (activeApp === 'messages-tray') {
        setActiveApp(null);
        return;
      }
      const { left, bottom }: any = calculateAnchorPoint(
        evt,
        anchorOffset,
        position,
        dimensions
      );
      setTrayAppCoords({
        left,
        bottom,
      });
      setTrayAppDimensions(dimensions);
      setActiveApp('messages-tray');
    },
    [activeApp, setTrayAppCoords, setTrayAppDimensions, setActiveApp]
  );

  return (
    <Flex
      id="messages-tray-icon"
      className="realm-cursor-hover"
      position="relative"
      whileTap={{ scale: 0.95 }}
      transition={{ scale: 0.2 }}
      onClick={onButtonClick}
    >
      <Badge
        wrapperHeight={iconSize}
        wrapperWidth={iconSize}
        top={1}
        right={1}
        minimal
        count={0}
      >
        <BarButton
          id="messages-tray-icon"
          height={28}
          whileTap={{ scale: 0.95 }}
          transition={{ scale: 0.1 }}
          width={28}
        >
          <Icon name={icon} size={24} pointerEvents="none" />
        </BarButton>
        {/* <IconButton
            size={iconSize}
            customBg={iconHoverColor}
            color={textColor}
            whileTap={{ scale: 0.9 }}
            transition={{ scale: 0.1 }}
          >
            <Icon name="Messages" size={24} pointerEvents="none" />
          </IconButton> */}
      </Badge>
    </Flex>
  );
};

export const MessagesTray = observer(MessagesTrayPresenter);
