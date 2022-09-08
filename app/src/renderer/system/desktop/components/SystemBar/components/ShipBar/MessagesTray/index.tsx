import { FC, useCallback, useMemo } from 'react';
import { darken, rgba } from 'polished';

import { observer } from 'mobx-react';

import { IconButton, Icons, Badge, Flex } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
type MessagesTrayProps = {
  theme: any;
};

const iconSize = 28;
const dimensions = {
  height: 600,
  width: 390,
};

export const MessagesTray: FC<MessagesTrayProps> = observer(
  (props: MessagesTrayProps) => {
    const { theme } = props;
    const { dockColor, textColor } = theme;
    const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
      useTrayApps();

    const position = 'top-left';
    const anchorOffset = { x: 4, y: 26 };

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
      [activeApp, anchorOffset, position, dimensions]
    );

    const iconHoverColor = useMemo(
      () => rgba(darken(0.05, theme.dockColor), 0.5),
      [theme.windowColor]
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
          <IconButton
            id="messages-tray-icon"
            size={iconSize}
            customBg={iconHoverColor}
            // data-selected
            color={textColor}
            whileTap={{ scale: 0.9 }}
            transition={{ scale: 0.1 }}
          >
            <Icons name="Messages" pointerEvents="none" />
          </IconButton>
        </Badge>
      </Flex>
    );
  }
);
