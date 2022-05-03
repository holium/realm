import { FC, createRef } from 'react';
import { motion } from 'framer-motion';
import { Flex, Icons, Pulser, Sigil } from '../../../../../../../../components';
import { ThemeStoreType } from '../../../../../../../../logic/theme/store';
import { ShipModelType } from '../../../../../../../../logic/ship/store';

import { MiniApp } from '../../MiniAppWindow';
import { TrayMenu } from '../../TrayMenu';
import { useShip } from '../../../../../../../../logic/store';
import { Profile } from '../../../../../../../apps/Profile';
import { useObserver } from 'mobx-react';
import { rgba } from 'polished';

type AccountTrayProps = {
  ship: ShipModelType;
  theme: ThemeStoreType;
};

export const AccountTray: FC<AccountTrayProps> = (props: AccountTrayProps) => {
  const { ship, theme } = props;
  const { shipLoader } = useShip();

  const { windowColor, textColor } = theme;
  const accountButtonRef = createRef<HTMLButtonElement>();
  const appRef = createRef<HTMLDivElement>();

  const dimensions = {
    height: 238,
    width: 350,
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
          backgroundColor={windowColor}
          textColor={textColor}
        >
          <Profile theme={theme} dimensions={dimensions} />
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
        {shipLoader.isLoaded ? (
          <Sigil
            simple
            size={28}
            avatar={ship.avatar}
            patp={ship.patp}
            color={[ship.color || '#000000', 'white']}
          />
        ) : (
          <Flex>
            <Pulser
              background={rgba(theme.backgroundColor, 0.5)}
              borderRadius={4}
              height={28}
              width={28}
            />
          </Flex>
        )}
      </motion.div>
    </TrayMenu>
  );
};
