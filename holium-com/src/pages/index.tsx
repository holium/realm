import { useState } from 'react';
import { spaces } from 'spaces';
import styled from 'styled-components';
import { SpaceKeys, TrayAppType } from 'types';

import { Flex } from '@holium/design-system/general';

import { Footer } from 'components/Footer';
import { GlobalStyle } from 'components/GlobalStyle';
import { Header } from 'components/Header';
import { Hero } from 'components/Hero';
import { ChatApp } from 'components/TrayApps/Chat';
import { NotificationApp } from 'components/TrayApps/Notifications';
import { RoomApp } from 'components/TrayApps/Rooms';
import { SpacesApp } from 'components/TrayApps/Spaces';
import { WalletApp } from 'components/TrayApps/Wallet';

import { Page } from '../components/Page';

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default function HomePage() {
  const [currentSpace, setCurrentSpace] = useState<SpaceKeys>('cyberpunk');
  const [theme, setTheme] = useState(spaces[currentSpace].theme);
  const [trayApp, setTrayApp] = useState<TrayAppType | null>(null);

  return (
    <>
      <GlobalStyle theme={theme} />
      <Page title="Holium">
        <Flex
          className="wallpaper"
          style={{ backgroundColor: theme.backgroundColor }}
          backgroundImage={`url(${theme.wallpaper})`}
        />
        <Header />
        <Main>
          <Hero />
        </Main>
        <Footer currentSpace={currentSpace} setCurrentApp={setTrayApp} />
      </Page>
      {trayApp?.id === 'spaces' && (
        <SpacesApp
          coords={trayApp.coords}
          isOpen={trayApp?.id === 'spaces'}
          closeTray={() => setTrayApp(null)}
          currentSpace={currentSpace}
          setCurrentSpace={(space) => {
            setCurrentSpace(space);
            setTheme(spaces[space].theme);
          }}
        />
      )}
      {trayApp?.id === 'chat' && (
        <ChatApp
          coords={trayApp.coords}
          isOpen={trayApp?.id === 'chat'}
          closeTray={() => setTrayApp(null)}
          currentSpace={currentSpace}
          setCurrentSpace={(space) => {
            setCurrentSpace(space);
            setTheme(spaces[space].theme);
          }}
        />
      )}
      {trayApp?.id === 'rooms-tray' && (
        <RoomApp
          coords={trayApp.coords}
          isOpen={trayApp?.id === 'rooms-tray'}
          closeTray={() => setTrayApp(null)}
          currentSpace={currentSpace}
          setCurrentSpace={(space) => {
            setCurrentSpace(space);
            setTheme(spaces[space].theme);
          }}
        />
      )}
      {trayApp?.id === 'wallet' && (
        <WalletApp
          coords={trayApp.coords}
          isOpen={trayApp?.id === 'wallet'}
          closeTray={() => setTrayApp(null)}
          currentSpace={currentSpace}
          setCurrentSpace={(space) => {
            setCurrentSpace(space);
            setTheme(spaces[space].theme);
          }}
        />
      )}
      {trayApp?.id === 'notifications' && (
        <NotificationApp
          coords={trayApp.coords}
          isOpen={trayApp?.id === 'notifications'}
          closeTray={() => setTrayApp(null)}
          currentSpace={currentSpace}
          setCurrentSpace={(space) => {
            setCurrentSpace(space);
            setTheme(spaces[space].theme);
          }}
        />
      )}
    </>
  );
}
