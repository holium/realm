import { ThemeProvider } from 'styled-components';
import { MotionConfig } from 'framer-motion';
import { GlobalStyle } from './App.styles';
import { Shell } from './system/shell';
import { theme } from './theme';
import { Provider, osStore } from './logic/store';

export default function App() {
  return (
    <Provider value={osStore}>
      <ThemeProvider theme={theme.light}>
        <MotionConfig transition={{ duration: 1, reducedMotion: 'user' }}>
          <GlobalStyle />
          {/* Modal provider */}
          <Shell isFullscreen={false} />
          <div id="portal-root" />
        </MotionConfig>
      </ThemeProvider>
    </Provider>
  );
}
