import { FC, useMemo } from 'react';
import { useMotionValue } from 'framer-motion';
import HoliumAnimated from 'renderer/components/Icons/holium';

import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { rgba } from 'polished';
import { BarStyle } from '@holium/design-system';

interface HomeButton {}

export const HomeButton: FC<HomeButton> = observer(() => {
  const { desktop, theme } = useServices();

  const { textColor } = useMemo(
    () => ({
      ...theme.currentTheme,
      dockColor: rgba(theme.currentTheme.dockColor, 0.55),
      textColor:
        theme.currentTheme.mode === 'light'
          ? rgba(theme.currentTheme.textColor, 0.7)
          : theme.currentTheme.textColor,
    }),
    [theme.currentTheme.dockColor]
  );
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  function handleMouse(event: any) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  const onHome = () => {
    DesktopActions.setHomePane(!desktop.showHomePane);
  };

  return useMemo(
    () => (
      <BarStyle
        justifyContent="center"
        width={40}
        animate={{ scale: 1 }}
        transition={{ scale: 0.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onHome()}
        onMouseMove={handleMouse}
      >
        <HoliumAnimated width="22px" height="22px" fill={textColor} />
      </BarStyle>
    ),
    [theme.currentTheme.textColor]
  );
});

export default { HomeButton };
