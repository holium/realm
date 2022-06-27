import { ThemeProvider } from 'styled-components';
import { MotionConfig } from 'framer-motion';
import { GlobalStyle } from './App.styles';
import { Shell } from './system';
import { theme } from './theme';
import {
  CoreProvider,
  useCore,
  coreStore,
  ServiceProvider,
  servicesStore,
  useServices,
} from './logic/store-2';
import { useMemo } from 'react';
import { Mouse } from './system/desktop/components/Mouse';

import { observer } from 'mobx-react';

export const App = observer(() => {
  const { booted } = useCore();
  const { shell } = useServices();
  const { desktop } = shell;
  const shellMemo = useMemo(() => (booted ? <Shell /> : <div />), [booted]);
  const mouseMemo = useMemo(() => {
    return (
      <Mouse
        hide={desktop.isMouseInWebview}
        cursorColor={desktop.mouseColor}
        animateOut={false}
      />
    );
  }, [desktop.mouseColor, desktop.isMouseInWebview]);

  return (
    <CoreProvider value={coreStore}>
      <ThemeProvider theme={theme.light}>
        <MotionConfig transition={{ duration: 1, reducedMotion: 'user' }}>
          <GlobalStyle blur={true} />
          {/* Modal provider */}
          <ServiceProvider value={servicesStore}>
            {mouseMemo}
            {shellMemo}
            <div id="portal-root" />
          </ServiceProvider>
        </MotionConfig>
      </ThemeProvider>
    </CoreProvider>
  );
});

export default App;
