import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';
import { spaces } from 'spaces';

import { Footer } from 'components/Footer';
import { Hero } from 'components/Hero';
import { Page } from 'components/Page';
import { useSpace } from 'components/SpaceContext';
import { ChatApp } from 'components/TrayApps/Chat';
import { NotificationApp } from 'components/TrayApps/Notifications';
import { RoomApp } from 'components/TrayApps/Rooms';
import { SpacesApp } from 'components/TrayApps/Spaces';
import { WalletApp } from 'components/TrayApps/Wallet';

import { SpaceKeys, TrayAppType } from '../types';

export default function LandingPage() {
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

  useEffect(() => {
    track('Landing Page');
  }, []);

  return (
    <>
      <Page
        title="Holium"
        body={<Hero />}
        footer={
          <Footer currentSpace={space} setCurrentApp={handleSetTrayApp} />
        }
      />
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
