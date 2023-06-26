import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Navigation } from './components';
import { Home } from './pages';
import useTroveStore, { TroveStore } from './store/troveStore';
import { theme } from './theme';

interface Props {
  selectedSpace: string;
  shipName: string;
}
const muiTheme = createTheme({
  palette: {
    primary: { main: theme.primary },
    error: { main: theme.error },
  },

  typography: {
    fontFamily: ['Rubik'].join(','),
    subtitle1: {
      fontSize: theme.typography.subtitle1,
    },
    subtitle2: {
      fontSize: theme.typography.subtitle2,
    },
    body1: {
      fontSize: theme.typography.body1,
    },
  },
});
export const Trove = ({ selectedSpace, shipName }: Props) => {
  //TODO: reinstate loader
  const setShipName = useTroveStore((store: TroveStore) => store.setShipName);
  const setMySpace = useTroveStore((store: TroveStore) => store.setMySpace);

  useEffect(() => {
    if (shipName) {
      setShipName(shipName);
      setMySpace('/' + shipName + '/our');
    }
  }, [shipName]);

  return (
    <main
      style={{
        height: '100vh',
        backgroundColor: 'transparent',
      }}
    >
      <ThemeProvider theme={muiTheme}>
        <Router>
          <Routes>
            <Route element={<Navigation selectedSpace={selectedSpace} />}>
              <Route path="index.html/:ship/:group" element={<Home />} />
              <Route
                path="index.html/"
                element={
                  <>Enter a space in the url example: ...apps/trove/~zod/our</>
                }
              />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </main>
  );
};
