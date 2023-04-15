import { BarStyle, HoliumButton } from '@holium/design-system';
import { observer } from 'mobx-react';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { useServices } from 'renderer/logic/store';

const HomeButtonPresenter = () => {
  const { desktop } = useServices();

  const onHome = () => {
    if (desktop.isHomePaneOpen) DesktopActions.closeHomePane();
    else DesktopActions.openHomePane();
  };

  return (
    <BarStyle
      justifyContent="center"
      width={40}
      animate={{ scale: 1 }}
      transition={{ scale: 0.5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onHome}
    >
      <HoliumButton />
    </BarStyle>
  );
};

export const HomeButton = observer(HomeButtonPresenter);
