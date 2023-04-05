import { observer } from 'mobx-react';
import { BarStyle, HoliumButton } from '@holium/design-system';
import { useAppState } from 'renderer/stores/app.store';

const HomeButtonPresenter = () => {
  const { shellStore } = useAppState();

  const onHome = () => {
    console.log('onHome', shellStore.isHomePaneOpen);
    if (shellStore.isHomePaneOpen) {
      shellStore.closeHomePane();
    } else shellStore.openHomePane();
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
