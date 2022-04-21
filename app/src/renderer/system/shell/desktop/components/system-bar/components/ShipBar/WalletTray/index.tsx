import { FC, createRef } from 'react';
import { motion } from 'framer-motion';
import { IconButton, Icons } from '../../../../../../../../components';
import { WindowThemeType } from '../../../../../../../../logic/stores/config';
import { MiniApp } from '../../MiniAppWindow';
import { TrayMenu } from '../../TrayMenu';

type WalletTrayProps = {
  theme: Partial<WindowThemeType>;
};

export const WalletTray: FC<WalletTrayProps> = (props: WalletTrayProps) => {
  const { backgroundColor, textColor } = props.theme;
  const walletButtonRef = createRef<HTMLButtonElement>();
  const dimensions = {
    height: 330,
    width: 330,
  };
  return (
    <TrayMenu
      id="wallet-tray"
      buttonRef={walletButtonRef}
      dimensions={dimensions}
      content={
        <MiniApp
          id="wallet-tray-app"
          dimensions={dimensions}
          backgroundColor={backgroundColor}
          textColor={textColor}
        />
      }
    >
      <IconButton
        id="wallet-tray-icon"
        ref={walletButtonRef}
        size={28}
        customBg={backgroundColor}
        color={textColor}
        whileTap={{ scale: 0.9 }}
        transition={{ scale: 0.1 }}
      >
        <Icons name="Wallet" pointerEvents="none" />
      </IconButton>
    </TrayMenu>
  );
};
