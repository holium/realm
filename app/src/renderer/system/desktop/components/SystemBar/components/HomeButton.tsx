import { FC, useMemo } from 'react';
import { SystemBarStyle } from '../SystemBar.styles';
import { motion, useMotionValue } from 'framer-motion';
import HoliumAnimated from 'renderer/components/Icons/holium';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { rgba } from 'polished';

type HomeButton = {};

export const HomeButton: FC<HomeButton> = observer(() => {
  const { shell } = useServices();
  const { desktop } = shell;

  const { dockColor, textColor } = useMemo(
    () => ({
      ...desktop.theme,
      dockColor: rgba(desktop.theme.dockColor!, 0.55),
      textColor:
        desktop.theme.mode === 'light'
          ? rgba(desktop.theme.textColor!, 0.8)
          : desktop.theme.textColor!,
    }),
    [desktop.theme.dockColor]
  );
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  function handleMouse(event: any) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }
  const onHome = () => {
    // DesktopActions.setBlur(!desktop.isBlurred);
    DesktopActions.setHomePane(!desktop.showHomePane);
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
          initial={{ backgroundColor: dockColor }}
          animate={{ scale: 1, backgroundColor: dockColor }}
          transition={{ scale: 0.5, backgroundColor: { duration: 0.5 } }}
          whileTap={{ scale: 0.95 }}
          width={42}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <HoliumAnimated width="22px" height="22px" fill={textColor} />
        </SystemBarStyle>
      </motion.div>
    ),
    [desktop.theme.textColor, desktop.theme.dockColor]
  );
});

export default { HomeButton };
