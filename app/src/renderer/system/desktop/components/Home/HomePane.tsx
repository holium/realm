import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { SpaceHome } from './Space';
import { OurHome } from './Ship';
import { PassportMenuProvider } from 'renderer/components/People/usePassportMenu';
import { AppSearchPopover } from './AppInstall/AppSearchPopover';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

const HomeWindow = styled(motion.div)`
  height: 100%;
  position: relative;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const HomePanePresenter = () => {
  const { shellStore, theme } = useAppState();
  const { spacesStore } = useShipStore();
  const isOpen = shellStore.isHomePaneOpen;

  const isOur = spacesStore.selected?.type === 'our';

  useEffect(() => {
    if (isOpen) shellStore.setIsBlurred(true);
    return () => shellStore.setIsBlurred(false);
  }, [isOpen]);

  return useMemo(
    () => (
      <AnimatePresence>
        <HomeWindow
          key="home-window"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isOpen ? 1 : 0,
            display: isOpen ? 'block' : 'none',
            background: rgba(
              theme.mode === 'light' ? '#FFFFFF' : '#000000',
              theme.mode === 'light' ? 0.25 : 0.25
            ),
          }}
          transition={{ background: { duration: 0.25 } }}
          exit={{ opacity: 0 }}
        >
          <PassportMenuProvider>
            {/* TODO make app grid not reanimate when switching around */}
            {isOur && <OurHome isOpen={isOpen} />}
            {!isOur && <SpaceHome isOpen={isOpen} />}
            <AppSearchPopover />
          </PassportMenuProvider>
        </HomeWindow>
      </AnimatePresence>
    ),
    [isOpen, theme, isOur]
  );
};

export const HomePane = observer(HomePanePresenter);
