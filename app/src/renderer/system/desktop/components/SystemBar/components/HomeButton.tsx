import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { BarStyle, HoliumButton } from '@holium/design-system';

const HomeButtonPresenter = () => {
  const { desktop } = useServices();

  const onHome = () => {
    DesktopActions.setHomePane(!desktop.showHomePane);
  };

  return (
    <BarStyle
      justifyContent="center"
      width={40}
      animate={{ scale: 1 }}
      transition={{ scale: 0.5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onHome()}
    >
      <HoliumButton />
    </BarStyle>
  );
};

export const HomeButton = observer(HomeButtonPresenter);
