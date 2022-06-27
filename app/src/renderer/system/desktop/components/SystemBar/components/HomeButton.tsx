import { FC, useMemo } from 'react';
import { SystemBarStyle } from '../SystemBar.styles';
import { motion, useMotionValue } from 'framer-motion';
import HoliumAnimated from 'renderer/components/Icons/holium';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store-2';

type HomeButton = {};

export const HomeButton: FC<HomeButton> = observer(() => {
  const { shell } = useServices();
  const { theme, desktop } = shell;

  const { dockColor, textColor } = theme.theme;
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  function handleMouse(event: any) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }
  const onHome = () => {
    desktop.setHomePane(!desktop.showHomePane);
  };

  return useMemo(
    () => (
      <motion.div
        style={{
          display: 'flex',
          placeItems: 'center',
          placeContent: 'center',
          borderRadius: 30,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          perspective: 400,
        }}
        onClick={() => onHome()}
        onMouseMove={handleMouse}
      >
        <SystemBarStyle
          style={{
            zIndex: 3,
            minWidth: 42,
          }}
          animate={{ scale: 1 }}
          transition={{ scale: 0.5 }}
          whileTap={{ scale: 0.95 }}
          width={42}
          display="flex"
          justifyContent="center"
          alignItems="center"
          customBg={dockColor}
        >
          <HoliumAnimated width="22px" height="22px" fill={textColor} />
        </SystemBarStyle>
      </motion.div>
    ),
    [theme.theme.textColor, theme.theme.dockColor]
  );
});

export default { HomeButton };
