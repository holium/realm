import React, { FC, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { rgba, lighten } from 'polished';
import styled from 'styled-components';

import { ThemeType } from '../../../../../theme';
import { WindowThemeType } from '../../../../../logic/stores/config';
import { Fill } from 'react-spaces';
import { Titlebar } from './components/Titlebar';
import { AppView } from './components/AppView';
import { useMst } from '../../../../../logic/store';
import { observer } from 'mobx-react';

type AppWindowStyleProps = {
  theme: ThemeType;
  customBg?: string;
};

export const AppWindowStyle = styled(styled(motion.div)<AppWindowStyleProps>`
  border-radius: 9px;
  backdrop-filter: blur(16px);
  height: 100%;
  width: 100%;
  box-shadow: ${(props: AppWindowStyleProps) => props.theme.elevations.two};
  border: 1px solid
    ${(props: AppWindowStyleProps) => rgba(props.customBg!, 0.7)};
  --webkit-transform: translate3d(0, 0, 0);
`)<AppWindowStyleProps>({
  // @ts-expect-error annoying
  backgroundColor: (props: SystemBarStyleProps) =>
    props.customBg ? rgba(lighten(0.22, props.customBg!), 0.8) : 'initial',
});

type AppWindowProps = {
  theme: Partial<WindowThemeType>;
  hideTitlebar?: boolean;
  children: React.ReactNode;
};

export const AppWindow: FC<AppWindowProps> = observer(
  (props: AppWindowProps) => {
    const { theme, children } = props;
    const { textColor, windowColor } = theme;
    const { desktopStore } = useMst();

    return (
      <Fill style={{ bottom: 50, padding: '8px' }}>
        <AppWindowStyle
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.15,
            },
          }}
          exit={{
            opacity: 0,
            y: 8,
            transition: {
              duration: 0.15,
            },
          }}
          style={{
            overflowY: 'hidden',
          }}
          color={textColor}
          customBg={windowColor}
        >
          {/* <Titlebar theme={theme} app={desktopStore.activeApp} /> */}
          <AppView app={desktopStore.activeApp!} />
        </AppWindowStyle>
      </Fill>
    );
  }
);

AppWindow.defaultProps = {
  hideTitlebar: false,
};

export default AppWindow;
