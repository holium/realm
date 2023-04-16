import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ShellActions } from 'renderer/logic/actions/shell';
import { Home } from './Space';
import { PassportMenuProvider } from 'renderer/components/People/usePassportMenu';
import { AppSearchPopover } from './AppInstall/AppSearchPopover';

const HomeWindow = styled(motion.div)`
  height: 100%;
  position: relative;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const HomePanePresenter = () => {
  const { theme, spaces, desktop } = useServices();
  const isOpen = desktop.isHomePaneOpen;
  const isOur = spaces.selected?.type === 'our';

  useEffect(() => {
    if (isOpen) ShellActions.setBlur(true);
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
              theme.currentTheme.mode === 'light' ? '#FFFFFF' : '#000000',
              theme.currentTheme.mode === 'light' ? 0.25 : 0.25
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
    [isOpen, theme.currentTheme, isOur]
  );
};

export const HomePane = observer(HomePanePresenter);
