import { FC, createRef } from 'react';
import { motion } from 'framer-motion';
import { Icons, MenuItem, Sigil } from '../../../../../../../../components';
import { WindowThemeType } from '../../../../../../../../logic/stores/config';
import { ShipModelType } from '../../../../../../../../logic/ship/store';

import { MiniApp } from '../../MiniAppWindow';
import { TrayMenu } from '../../TrayMenu';
import { useMst } from '../../../../../../../../logic/store';
import { Profile } from '../../../../../../../apps/Profile';

type AccountTrayProps = {
  ship: ShipModelType;
  theme: WindowThemeType;
};

export const AccountTray: FC<AccountTrayProps> = (props: AccountTrayProps) => {
  const { ship } = props;
  const { shipStore } = useMst();
  const { backgroundColor, textColor } = props.theme;
  const accountButtonRef = createRef<HTMLButtonElement>();
  const appRef = createRef<HTMLDivElement>();

  const dimensions = {
    height: 156,
    width: 230,
  };

  return (
    <TrayMenu
      id="account-tray"
      appRef={appRef}
      buttonRef={accountButtonRef}
      dimensions={dimensions}
      content={
        <MiniApp
          id="account-tray-app"
          ref={appRef}
          dimensions={dimensions}
          backgroundColor={backgroundColor}
          textColor={textColor}
        >
          <Profile theme={props.theme} dimensions={dimensions} />
        </MiniApp>
      }
    >
      <motion.div
        id="account-tray-icon"
        // @ts-expect-error -
        ref={accountButtonRef}
        style={{
          cursor: 'pointer',
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ scale: 0.2 }}
      >
        <Sigil
          simple
          size={28}
          avatar={ship.avatar}
          patp={ship.patp}
          color={[ship.color || '#000000', 'white']}
        />
      </motion.div>
    </TrayMenu>
  );
};
