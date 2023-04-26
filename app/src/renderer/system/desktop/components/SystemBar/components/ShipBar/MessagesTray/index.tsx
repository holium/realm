import { useCallback } from 'react';
import { observer } from 'mobx-react';

import { BarButton, Flex, Icon } from '@holium/design-system';

import { AppRegistry } from 'renderer/apps/registry';
import { useTrayApps } from 'renderer/apps/store';
import { Badge } from 'renderer/components';
import { calculateAnchorPoint } from 'renderer/lib/position';

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
      className="realm-cursor-hover"
      position="relative"
      whileTap={{ scale: 0.95 }}
      transition={{ scale: 0.2 }}
      onClick={onButtonClick}
    >
      <Badge
        wrapperHeight={iconSize}
        wrapperWidth={iconSize}
        bottom={0}
        right={0}
        minimal
        count={0}
      >
        <BarButton
          id="messages-tray-icon"
          height={28}
          whileTap={{ scale: 0.95 }}
          transition={{ scale: 0.1 }}
          isSelected={activeApp === 'messages-tray'}
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
