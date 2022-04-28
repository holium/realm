import { FC, createRef } from 'react';
import { motion } from 'framer-motion';
import { IconButton, Icons } from '../../../../../../../../components';
import { WindowThemeType } from '../../../../../../../../logic/stores/config';
import { MiniApp } from '../../MiniAppWindow';
import { TrayMenu } from '../../TrayMenu';
import { Wallet } from '../../../../../../../apps/Wallet';

type WalletTrayProps = {
  theme: WindowThemeType;
};

export const WalletTray: FC<WalletTrayProps> = (props: WalletTrayProps) => {
  const { backgroundColor, textColor } = props.theme;
  const walletButtonRef = createRef<HTMLButtonElement>();
  const appRef = createRef<HTMLDivElement>();

  const dimensions = {
    height: 360,
    width: 330,
  };

  return (
    <TrayMenu
      id="wallet-tray"
      appRef={appRef}
      buttonRef={walletButtonRef}
      dimensions={dimensions}
      content={
        <MiniApp
          id="wallet-tray-app"
          ref={appRef}
          dimensions={dimensions}
          backgroundColor={backgroundColor}
          textColor={textColor}
        >
          <Wallet theme={props.theme} dimensions={dimensions} />
        </MiniApp>
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
