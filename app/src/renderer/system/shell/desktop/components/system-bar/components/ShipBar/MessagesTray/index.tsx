import React, { FC, useRef, createRef } from 'react';
import { motion } from 'framer-motion';
import { IconButton, Icons } from '../../../../../../../../components';
import { WindowThemeType } from '../../../../../../../../logic/stores/config';
import { MiniApp } from '../../MiniAppWindow';
import { TrayMenu } from '../../TrayMenu';
import { Chat } from '../../../../../../../apps/Messages';

type MessagesTrayProps = {
  theme: Partial<WindowThemeType>;
};

export const MessagesTray: FC<MessagesTrayProps> = (
  props: MessagesTrayProps
) => {
  const { backgroundColor, textColor } = props.theme;
  const messagesButtonRef = createRef<HTMLButtonElement>();
  const appRef = createRef<HTMLDivElement>();

  const dimensions = {
    height: 550,
    width: 370,
  };

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
          backgroundColor={backgroundColor}
          textColor={textColor}
        >
          <Chat theme={props.theme} dimensions={dimensions} />
        </MiniApp>
      }
    >
      <IconButton
        id="messages-tray-icon"
        ref={messagesButtonRef}
        size={28}
        customBg={backgroundColor}
        // data-selected
        color={textColor}
        whileTap={{ scale: 0.9 }}
        transition={{ scale: 0.1 }}
      >
        <Icons name="Messages" pointerEvents="none" />
      </IconButton>
    </TrayMenu>
  );
};
