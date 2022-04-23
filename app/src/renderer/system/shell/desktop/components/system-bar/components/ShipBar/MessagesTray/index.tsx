import React, { FC, useRef, createRef } from 'react';
import { motion } from 'framer-motion';
import { IconButton, Icons } from '../../../../../../../../components';
import { WindowThemeType } from '../../../../../../../../logic/stores/config';
import { MiniApp } from '../../MiniAppWindow';
import { TrayMenu } from '../../TrayMenu';

type MessagesTrayProps = {
  theme: Partial<WindowThemeType>;
};

export const MessagesTray: FC<MessagesTrayProps> = (
  props: MessagesTrayProps
) => {
  const { backgroundColor, textColor } = props.theme;
  const messagesButtonRef = createRef<HTMLButtonElement>();

  const dimensions = {
    height: 500,
    width: 370,
  };
  return (
    <TrayMenu
      id="messages-tray"
      buttonRef={messagesButtonRef}
      dimensions={dimensions}
      content={
        <MiniApp
          id="messages-tray-app"
          dimensions={dimensions}
          backgroundColor={backgroundColor}
          textColor={textColor}
        />
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
