import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { ViewPort, Layer } from 'react-spaces';
import { useAuth, useMst, useShip } from '../../logic/store';
import { Auth } from './auth';
import { Desktop } from './desktop';
import { BackgroundImage, BackgroundFill } from './Shell.styles';
import { AnimatePresence } from 'framer-motion';

type ShellProps = {};

const DragBar = styled.div`
  position: absolute;
  height: 22px;
  left: 0;
  top: 0;
  right: 0;
  --webkit-app-region: drag;
  app-region: drag;
`;

export const Shell: FC<ShellProps> = observer((props: ShellProps) => {
  const { themeStore, desktopStore } = useMst();
  const { authStore } = useAuth();
  const { ship } = useShip();

  const isFullscreen = desktopStore.isFullscreen;
  const wallpaper = themeStore.theme.wallpaper;
  const bgImage = useMemo(() => wallpaper, [wallpaper]);

  const hasWallpaper = bgImage ? true : false;
  // const loggedIn = true; // shipStore.session?.loggedIn;

  const loggedIn = authStore.currentShip?.loggedIn && !authStore.isLoading;
  const isBlurred = useMemo(
    () => !loggedIn || desktopStore.isBlurred,
    [loggedIn, desktopStore.isBlurred]
  );

  const shipLoaded = ship && ship.isLoaded;
  console.log('rerendering shell');
  return (
    <ViewPort>
      <Layer zIndex={0}>{!isFullscreen && <DragBar />}</Layer>
      <BgImage blurred={isBlurred} wallpaper={bgImage} />
      <BackgroundFill hasWallpaper={hasWallpaper}>
        {loggedIn ? (
          <Desktop
            hasLoaded={shipLoaded}
            hasWallpaper={true}
            isFullscreen={isFullscreen}
          />
        ) : (
          <Auth hasWallpaper={hasWallpaper} />
        )}
      </BackgroundFill>
    </ViewPort>
  );
});

export default Shell;

const BgImage = ({
  blurred,
  wallpaper,
}: {
  blurred: boolean;
  wallpaper: string;
}) => {
  return (
    <AnimatePresence>
      <BackgroundImage
        key={wallpaper}
        src={wallpaper}
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        animate={{
          opacity: 1,
          filter: blurred ? 'blur(20px)' : 'blur(0px)',
        }}
        transition={{
          opacity: { duration: 1 },
        }}
      />
    </AnimatePresence>
  );
};
