/* Mainbar */
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import styled from 'styled-components';

import { ThemeType } from '../../../../../theme';

interface MiniAppStyleProps {
  theme: ThemeType;
  customBg?: string;
}

export const MiniAppWindow = styled(motion.div)<MiniAppStyleProps>`
  border-radius: 16px;
  overflow: hidden;
  /* width: 270px; */
  ::-webkit-scrollbar {
    display: none;
  }
  /* backdrop-filter: blur(24px); */
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  background: var(--rlm-window-color);
  border: 1px solid var(--rlm-border-color);
  z-index: 12;
  box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.12);
`;

interface MiniAppProps {
  id: string;
  innerRef?: any;
  backgroundColor?: string;
  textColor?: string;
  buttonRef?: any;
  children: any | React.ReactNode;
}

const MiniAppPresenter = ({ id, children, innerRef }: MiniAppProps) => {
  const { dimensions } = useTrayApps();

  return (
    <MiniAppWindow
      id={id}
      ref={innerRef}
      style={{
        overflowY: 'hidden',
        width: dimensions.width,
        height: dimensions.height,
      }}
      onContextMenu={(evt: any) => evt.stopPropagation()}
    >
      {children}
    </MiniAppWindow>
  );
};

export const MiniApp = observer(MiniAppPresenter);
