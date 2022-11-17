import { FC, useState, useMemo } from 'react';
import { observer } from 'mobx-react';

import { SystemBarStyle } from '../../SystemBar.styles';
import { Flex } from 'renderer/components';
import { WalletTray } from './WalletTray';
import { MessagesTray } from './MessagesTray';
import { AccountTray } from './AccountTray';
import { useServices } from 'renderer/logic/store';
import { darken, rgba } from 'polished';

interface ShipTrayProps {}

export const ShipTray: FC<ShipTrayProps> = observer(() => {
  const { theme } = useServices();

  const { dockColor, textColor } = useMemo(
    () => ({
      ...theme.currentTheme,
      dockColor: rgba(theme.currentTheme.dockColor, 0.55),
    }),
    [theme.currentTheme.dockColor]
  );

  const iconHoverColor = useMemo(
    () => rgba(darken(0.05, theme.currentTheme.dockColor), 0.5),
    [theme.currentTheme.windowColor]
  );
  const [voiceOn, setVoiceOn] = useState(false);

  return (
    <SystemBarStyle
      initial={{ backgroundColor: dockColor }}
      animate={{ scale: 1, backgroundColor: dockColor }}
      transition={{ scale: 0.5, backgroundColor: { duration: 0.5 } }}
      pl={2}
      pr={2}
      backgroundColor={dockColor}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Flex gap={10} justifyContent="center" alignItems="center">
        {/* <IconButton
          size={28}
          customBg={dockColor}
          color={textColor}
          onClick={() => setVoiceOn(!voiceOn)}
        >
          <motion.div whileTap={{ scale: 0.9 }} transition={{ scale: 0.2 }}>
            <Icons
              name={voiceOn ? 'MicOn' : 'MicOff'}
              opacity={voiceOn ? 1 : 0.6}
            />
          </motion.div>
        </IconButton> */}
        <WalletTray theme={theme.currentTheme} />
        <MessagesTray theme={theme.currentTheme} />
        {/* <IconButton
          id="notification-tray-icon"
          size={28}
          customBg={iconHoverColor}
          color={textColor}
          whileTap={{ scale: 0.95 }}
          transition={{ scale: 0.1 }}
          onClick={() => {}}
        >
          <Icons name="Notifications" pointerEvents="none" />
        </IconButton> */}
        <AccountTray theme={theme.currentTheme} />
        {/* <TrayClock /> */}
      </Flex>
    </SystemBarStyle>
  );
});

export default { ShipTray };
