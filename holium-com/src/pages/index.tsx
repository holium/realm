import { useState } from 'react';
import { spaces } from 'spaces';
import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

import { Footer } from 'components/Footer';
import { GlobalStyle } from 'components/GlobalStyle';
import { Header } from 'components/Header';
import { Hero } from 'components/Hero';
import { Page } from 'components/Page';
import { useSpace } from 'components/SpaceContext';
import { ChatApp } from 'components/TrayApps/Chat';
import { NotificationApp } from 'components/TrayApps/Notifications';
import { RoomApp } from 'components/TrayApps/Rooms';
import { SpacesApp } from 'components/TrayApps/Spaces';
import { WalletApp } from 'components/TrayApps/Wallet';

import { SpaceKeys, TrayAppType } from '../types';

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default function HomePage() {
  const { space } = useSpace();
  const [trayApp, setTrayApp] = useState<TrayAppType | null>(null);

  const handleSetTrayApp = (app: TrayAppType) => {
    if (app?.id === 'spaces') {
      // Preload all the wallpapers so the space transition is smooth.
      Object.keys(spaces).map((s) => {
        const theme = spaces[s as SpaceKeys]?.theme;
        const wallpaper = new Image();
        wallpaper.src = theme.wallpaper;
        return wallpaper;
      });
    }

    setTrayApp(app);
  };

  return (
    <>
      <GlobalStyle theme={spaces[space].theme} />
      <Page title="Holium">
        <Flex
          className="wallpaper"
          style={{ backgroundColor: spaces[space].theme.backgroundColor }}
          backgroundImage={`url(${spaces[space].theme.wallpaper})`}
        />
        <Header />
        <Main>
          <Hero />
        </Main>
        <Footer currentSpace={space} setCurrentApp={handleSetTrayApp} />
      </Page>
      {trayApp && (
        <>
          <SpacesApp
            coords={trayApp.coords}
            isOpen={trayApp.id === 'spaces'}
            closeTray={() => setTrayApp(null)}
          />
          <ChatApp
            coords={trayApp.coords}
            isOpen={trayApp.id === 'chat'}
            closeTray={() => setTrayApp(null)}
          />
          <RoomApp
            coords={trayApp.coords}
            isOpen={trayApp.id === 'rooms-tray'}
            closeTray={() => setTrayApp(null)}
          />
          <WalletApp
            coords={trayApp.coords}
            isOpen={trayApp.id === 'wallet'}
            closeTray={() => setTrayApp(null)}
          />
          <NotificationApp
            coords={trayApp.coords}
            isOpen={trayApp.id === 'notifications'}
            closeTray={() => setTrayApp(null)}
          />
        </>
      )}
    </>
  );
}
