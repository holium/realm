/* Mainbar */
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';
import { rgba, darken } from 'polished';
import { useTrayApps } from 'renderer/apps/store';
import styled from 'styled-components';

import { ThemeType } from '../../../../../theme';

interface MiniAppStyleProps {
  theme: ThemeType;
  customBg?: string;
}

export const MiniAppWindow = styled(styled(motion.div)<MiniAppStyleProps>`
  border-radius: 16px;
  overflow: hidden;
  width: 270px;
  ::-webkit-scrollbar {
    display: none;
  }
  box-shadow: ${(props: MiniAppStyleProps) => props.theme.elevations.two};
  border: 1px solid
    ${(props: MiniAppStyleProps) => darken(0.1, props.customBg!)};
  /* border: 1px solid ${(props: MiniAppStyleProps) =>
    rgba(props.customBg!, 0.7)}; */
`)<MiniAppStyleProps>({
  // @ts-expect-error annoying
  backgroundColor: (props: SystemBarStyleProps) => props.customBg || 'initial',
});

interface MiniAppProps {
  id: string;
  innerRef?: any;
  backgroundColor?: string;
  textColor?: string;
  buttonRef?: any;
  children: any | React.ReactNode;
}

export const MiniApp = observer(
  ({ id, backgroundColor, textColor, children, innerRef }: MiniAppProps) => {
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
        color={textColor}
        customBg={backgroundColor}
        onContextMenu={(evt: any) => evt.stopPropagation()}
      >
        {children}
      </MiniAppWindow>
    );
  }
);
