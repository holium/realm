import { FC, createRef, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SystemBarStyle } from '../../SystemBar.styles';
import { Flex, IconButton, Icons } from '../../../../../../../components';
import { WindowThemeType } from '../../../../../../../logic/stores/config';
import { ShipModelType } from '../../../../../../../logic/ship/store';
import { WalletTray } from './WalletTray';
import { MessagesTray } from './MessagesTray';
import { AccountTray } from './AccountTray';

type ShipTrayProps = {
  ship: ShipModelType;
  theme: Partial<WindowThemeType>;
};

export const ShipTray: FC<ShipTrayProps> = (props: ShipTrayProps) => {
  const { ship, theme } = props;
  const { backgroundColor, textColor } = theme;
  const [voiceOn, setVoiceOn] = useState(false);

  return (
    <SystemBarStyle
      animate={{ scale: 1 }}
      transition={{ scale: 0.5 }}
      pl={2}
      pr={2}
      customBg={backgroundColor}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Flex gap={10} justifyContent="center" alignItems="center">
        {/* Toggles voice on/off for voice subsystem */}
        <IconButton
          size={28}
          customBg={backgroundColor}
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
        <WalletTray theme={theme} />
        {/* Holds the DM interface */}
        <MessagesTray theme={theme} />
        {/* Allows logging out */}
        <AccountTray theme={theme} ship={ship} />
      </Flex>
    </SystemBarStyle>
  );
};

export default { ShipTray };
