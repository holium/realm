import { FC, createRef } from 'react';
import { motion } from 'framer-motion';
import { Flex, Pulser, Sigil } from 'renderer/components';

import { MiniApp } from '../../MiniAppWindow';
import { TrayMenu } from '../../TrayMenu';
import { Profile } from 'renderer/apps/Profile';
import { rgba } from 'polished';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { useServices } from 'renderer/logic/store';

type AccountTrayProps = {
  theme: ThemeModelType;
};

export const AccountTray: FC<AccountTrayProps> = (props: AccountTrayProps) => {
  const { theme } = props;
  const { ship } = useServices();
  // const { shipLoader } = useShip();

  const { windowColor, dockColor, textColor } = theme;
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
          backgroundColor={dockColor}
          textColor={textColor}
        >
          <Profile theme={theme} dimensions={dimensions} />
        </MiniApp>
      }
    >
      <motion.div
        id="account-tray-icon"
        className="realm-cursor-hover"
        // @ts-expect-error -
        ref={accountButtonRef}
        // style={{
        //   cursor: 'pointer',
        // }}
        whileTap={{ scale: 0.9 }}
        transition={{ scale: 0.2 }}
      >
        {ship ? (
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
