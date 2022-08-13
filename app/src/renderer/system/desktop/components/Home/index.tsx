import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ShellActions } from 'renderer/logic/actions/shell';
import { AppGrid } from './Ship/AppGrid';
import { SpaceHome } from './Space';
import { OurHome } from './Ship';

type HomeWindowProps = {};

const HomeWindow = styled(motion.div)<HomeWindowProps>`
  height: 100%;
`;

type HomePaneProps = {
  isOpen?: boolean;
};

export const HomePane: FC<HomePaneProps> = observer((props: HomePaneProps) => {
  const { isOpen } = props;
  const { desktop, spaces } = useServices();

  const isOur = spaces.selected?.type === 'our';

  useEffect(() => {
    if (isOpen) ShellActions.setBlur(true);
  }, [isOpen]);

  return (
    <AnimatePresence>
      <HomeWindow
        key="home-window"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          display: isOpen ? 'block' : 'none',
          background: rgba(
            desktop.theme.mode === 'light' ? '#FFFFFF' : '#000000',
            desktop.theme.mode === 'light' ? 0.25 : 0.25
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
  );
});
