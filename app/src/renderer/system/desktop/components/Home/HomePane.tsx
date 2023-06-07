import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react';
import { rgba } from 'polished';
import styled from 'styled-components';

import { PassportMenuProvider } from 'renderer/components/People/usePassportMenu';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { AppSearchPopover } from './AppInstall/AppSearchPopover';
import { Home } from './Space';

const HomeWindow = styled(motion.div)`
  height: 100%;
  position: relative;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const HomePanePresenter = () => {
  const { shellStore, theme, showTitleBar } = useAppState();
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
          initial={{ opacity: 0, paddingTop: showTitleBar ? 20 : 0 }}
          animate={{
            opacity: isOpen ? 1 : 0,
            display: isOpen ? 'block' : 'none',
            paddingTop: showTitleBar ? 20 : 0,
            background: rgba(
              theme.mode === 'light' ? '#FFFFFF' : '#000000',
              theme.mode === 'light' ? 0.25 : 0.25
            ),
          }}
          transition={{ background: { duration: 0.25 } }}
          exit={{ opacity: 0 }}
        >
          <PassportMenuProvider>
            <Home isOpen={isOpen} isOur={isOur} />
            <AppSearchPopover />
          </PassportMenuProvider>
        </HomeWindow>
      </AnimatePresence>
    ),
    [isOpen, theme, isOur]
  );
};

export const HomePane = observer(HomePanePresenter);
