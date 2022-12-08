import { FC, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react';
import { darken, rgba } from 'polished';

import { Flex, Pulser, Sigil, Box } from 'renderer/components';
import { ThemeModelType } from 'os/services/theme.model';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/apps/store';
import { calculateAnchorPoint } from 'renderer/logic/lib/position';
import { motion } from 'framer-motion';

const position = 'top-left';
const anchorOffset = { x: 8, y: 26 };
const dimensions = {
  height: 450,
  width: 400,
};

interface AccountTrayProps {
  theme: ThemeModelType;
}

export const AccountTray: FC<AccountTrayProps> = observer(
  (props: AccountTrayProps) => {
    const { theme } = props;
    const { ship, notifications } = useServices();
    const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
      useTrayApps();

    const unreadCount = useMemo(
      () => notifications.unseen.length,
      [notifications.unseen.length]
    );

    const onButtonClick = useCallback(
      (evt: any) => {
        if (activeApp === 'account-tray') {
          setActiveApp(null);
          evt.stopPropagation();
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
        setActiveApp('account-tray');
      },
      [activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions]
    );

    return (
      <motion.div
        id="account-tray-icon"
        className="realm-cursor-hover"
        style={{
          position: 'relative',
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ scale: 0.2 }}
        onClick={onButtonClick}
      >
        {ship ? (
          <Flex style={{ pointerEvents: 'none' }}>
            <Sigil
              simple
              size={28}
              avatar={ship.avatar}
              patp={ship.patp}
              color={[ship.color || '#000000', 'white']}
            />
          </Flex>
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
        {unreadCount > 0 && (
          <Box
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              default: { duration: 0.2 },
            }}
            style={{
              position: 'absolute',
              background: '#4E9EFD',
              border: `2px solid ${darken(0.025, theme.dockColor)}`,
              borderRadius: '50%',
              right: -3,
              bottom: -3,
              height: 11,
              width: 11,
            }}
          />
        )}
      </motion.div>
    );
  }
);
