import { FC, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ShellActions } from 'renderer/logic/actions/shell';
import { SpaceHome } from './Space';
import { OurHome } from './Ship';

interface HomeWindowProps {}

const HomeWindow = styled(motion.div)<HomeWindowProps>`
  height: 100%;
`;

export const HomePane: FC = observer(() => {
  const { theme, spaces, desktop } = useServices();
  const isOpen = desktop.showHomePane;

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
          {/* TODO make app grid not reanimate when switching around */}
          {isOur && <OurHome isOpen={isOpen} />}
          {!isOur && <SpaceHome isOpen={isOpen} />}
        </HomeWindow>
      </AnimatePresence>
    ),
    [isOpen, theme.currentTheme, isOur]
  );
});
