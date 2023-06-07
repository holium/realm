import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import api from './api';
import { Navigation } from './Navigation';
import { Dictionary, Home, Word } from './pages';
import { useStore } from './store';
import { log } from './utils';

declare global {
  interface Window {
    ship: string;
  }
}

function App() {
  const { space } = useStore();

  const doStateScry = async () => {
    if (!space) return;
    try {
      const s = await api.getState();
      const subscribeToSpace = await api.subscribePath(space);
      // const path = await api.createPath(space, []);
      //log('path', path);

      log('s', s);
      log('subscribeToSpace', subscribeToSpace);
    } catch (error) {
      log('Error performing /db scry:', error);
    }
  };
  useEffect(() => {
    doStateScry();
  }, [space]);

  return (
    <>
      <div id="portal-root" />
      <Router>
        <Routes>
          <Route element={<Navigation />}>
            <Route path="/apps/lexicon/:ship/:group/:word" element={<Word />} />
            <Route path="/apps/lexicon/:ship/:group" element={<Home />} />
            <Route path="/apps/lexicon/dict/:word" element={<Dictionary />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
