import { FC, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';

import { SystemBarStyle } from '../../SystemBar.styles';
import { Flex, IconButton, Icons } from 'renderer/components';
import { WalletTray } from './WalletTray';
import { MessagesTray } from './MessagesTray';
import { AccountTray } from './AccountTray';
import { useServices } from 'renderer/logic/store';

type ShipTrayProps = {};

export const ShipTray: FC<ShipTrayProps> = observer(() => {
  const { shell } = useServices();
  const { desktop } = shell;

  const { dockColor, textColor } = useMemo(
    () => desktop.theme,
    [desktop.theme]
  );

  const [voiceOn, setVoiceOn] = useState(false);

  return (
    <SystemBarStyle
      animate={{ scale: 1 }}
      transition={{ scale: 0.5 }}
      pl={2}
      pr={2}
      customBg={dockColor}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Flex gap={10} justifyContent="center" alignItems="center">
        {/* Toggles voice on/off for voice subsystem */}
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
        {/* Holds the wallet interface */}
        <WalletTray theme={desktop.theme} />
        {/* Holds the DM interface */}
        <MessagesTray theme={desktop.theme} />
        {/* Allows logging out */}
        <AccountTray theme={desktop.theme} />
      </Flex>
    </SystemBarStyle>
  );
});

export default { ShipTray };
