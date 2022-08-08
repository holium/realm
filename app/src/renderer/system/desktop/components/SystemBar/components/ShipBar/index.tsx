import { FC, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';

import { SystemBarStyle } from '../../SystemBar.styles';
import { Flex, IconButton, Icons } from 'renderer/components';
import { WalletTray } from './WalletTray';
import { MessagesTray } from './MessagesTray';
import { AccountTray } from './AccountTray';
import { useServices } from 'renderer/logic/store';
import { TrayClock } from './Clock';
import { rgba } from 'polished';

type ShipTrayProps = {};

export const ShipTray: FC<ShipTrayProps> = observer(() => {
  const { desktop } = useServices();

  const { dockColor, textColor } = useMemo(
    () => ({
      ...desktop.theme,
      dockColor: rgba(desktop.theme.dockColor!, 0.55),
    }),
    [desktop.theme.dockColor]
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
        <IconButton
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
        </IconButton>
        <WalletTray theme={desktop.theme} />
        <MessagesTray theme={desktop.theme} />
        <AccountTray theme={desktop.theme} />
        {/* <TrayClock /> */}
      </Flex>
    </SystemBarStyle>
  );
});

export default { ShipTray };
