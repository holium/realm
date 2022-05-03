import React, { FC, useMemo, useRef, createRef } from 'react';
import { motion } from 'framer-motion';
import { observer, useObserver } from 'mobx-react';
import { useMst } from '../../../../../../../../logic/store';
import { IconButton, Icons, Badge } from '../../../../../../../../components';
import { WindowThemeType } from '../../../../../../../../logic/stores/config';
import { MiniApp } from '../../MiniAppWindow';
import { TrayMenu } from '../../TrayMenu';
import { Chat } from '../../../../../../../apps/Messages';

type MessagesTrayProps = {
  theme: WindowThemeType;
};

const iconSize = 28;
const dimensions = {
  height: 600,
  width: 390,
};

export const MessagesTray: FC<MessagesTrayProps> = (
  props: MessagesTrayProps
) => {
  const { theme } = props;
  const messagesButtonRef = useRef<HTMLButtonElement>(null);
  const { dockColor, windowColor, textColor } = theme;

  const appRef = createRef<HTMLDivElement>();

  // messagesButtonRef.current && messagesButtonRef.current.click();
  return (
    <TrayMenu
      id="messages-tray"
      appRef={appRef}
      buttonRef={messagesButtonRef}
      dimensions={dimensions}
      content={
        <MiniApp
          id="messages-tray-app"
          ref={appRef}
          dimensions={dimensions}
          backgroundColor={windowColor}
          textColor={textColor}
        >
          <Chat theme={theme} dimensions={dimensions} />
        </MiniApp>
      }
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
          ref={messagesButtonRef}
          size={iconSize}
          customBg={dockColor}
          // data-selected
          color={textColor}
          whileTap={{ scale: 0.9 }}
          transition={{ scale: 0.1 }}
        >
          <Icons name="Messages" pointerEvents="none" />
        </IconButton>
      </Badge>
    </TrayMenu>
  );
};
