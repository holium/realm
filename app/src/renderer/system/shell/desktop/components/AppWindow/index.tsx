import React, { FC, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { rgba, lighten } from 'polished';
import styled from 'styled-components';

import { ThemeType } from '../../../../../theme';
import { WindowThemeType } from '../../../../../logic/stores/config';
import { Fill } from 'react-spaces';

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
`)<AppWindowStyleProps>({
  // @ts-expect-error annoying
  backgroundColor: (props: SystemBarStyleProps) =>
    props.customBg ? rgba(lighten(0.22, props.customBg!), 0.8) : 'initial',
});

type AppWindowProps = {
  theme: Partial<WindowThemeType>;
  children: React.ReactNode;
};

export const AppWindow: FC<AppWindowProps> = (props: AppWindowProps) => {
  const { theme, children } = props;
  const { textColor, backgroundColor } = theme;
  return (
    <Fill style={{ bottom: 50, padding: '8px' }}>
      <AppWindowStyle
        style={{
          overflowY: 'hidden',
        }}
        color={textColor}
        customBg={backgroundColor}
      >
        {children}
      </AppWindowStyle>
    </Fill>
  );
};

export default AppWindow;
