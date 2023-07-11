import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { trovePreload } from '../../app/src/os/services/ship/trove.service';
import { updateHandler } from './api/updates';
import { Navigation } from './components';
import { Home } from './pages';
import useTroveStore, { TroveStore } from './store/troveStore';
import { theme } from './theme';
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
interface Props {
  selectedSpace: string;
  shipName: string;
  TroveIPC: typeof trovePreload;
  update: any;
  useStorage: any;
  uploadFile: any;
  deleteFile: any;
}

export const Trove = ({
  selectedSpace,
  shipName,
  TroveIPC,
  update,
  useStorage,
  uploadFile,
  deleteFile,
}: Props) => {
  const setShipName = useTroveStore((store: TroveStore) => store.setShipName);
  const setMySpace = useTroveStore((store: TroveStore) => store.setMySpace);
  const setSpace = useTroveStore((store: TroveStore) => store.setSpace);
  const space = useTroveStore((store: TroveStore) => store.space);
  const setApi = useTroveStore((store: TroveStore) => store.setApi);
  useEffect(() => {
    //subscribe to updates here
    TroveIPC.UIUpdates();
    //add our api instance to the store
    setApi(TroveIPC);
  }, [TroveIPC]);
  useEffect(() => {
    if (update) {
      updateHandler(update);
    }
  }, [update]);
  useEffect(() => {
    if (shipName) {
      setShipName(shipName);
      setMySpace(shipName + '/our');
    }
  }, [shipName]);
  useEffect(() => {
    if (selectedSpace) {
      const newSpace = selectedSpace.substring(1);
      setSpace(newSpace);
    }
  }, [selectedSpace]);

  if (!space) return null;
  return (
    <main
      style={{
        height: '100%',
        backgroundColor: 'transparent',
      }}
    >
      <ThemeProvider theme={muiTheme}>
        <Router>
          <Routes>
            <Route element={<Navigation selectedSpace={selectedSpace} />}>
              <Route
                path="index.html/:ship/:group"
                element={
                  <Home
                    useStorage={useStorage}
                    uploadFile={uploadFile}
                    deleteFile={deleteFile}
                  />
                }
              />
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
