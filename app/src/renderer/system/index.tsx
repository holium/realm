import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { ViewPort, Layer } from 'react-spaces';
// import { useAuth, useMst, useShip } from 'renderer/logic/store';
import { coreStore, useCore, useServices } from 'renderer/logic/store';
import { Auth } from './auth';
import { Desktop } from './desktop';
import { BackgroundImage, BackgroundFill } from './system.styles';
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
  const { loggedIn } = useCore();
  const { shell, identity, ship } = useServices();
  const { theme, desktop } = shell;
  const { auth } = identity;

  const isFullscreen = desktop.isFullscreen;
  const wallpaper = theme.theme.wallpaper;
  const bgImage = useMemo(() => wallpaper, [wallpaper]);

  const hasWallpaper = bgImage ? true : false;
  const isBlurred = useMemo(
    () => !loggedIn && desktop.isBlurred,
    [desktop.isBlurred, loggedIn]
  );
  const shipLoaded = ship?.loader.isLoaded;

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
        {/* <Auth hasWallpaper={hasWallpaper} /> */}
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
  return useMemo(
    () => (
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
    ),
    [blurred, wallpaper]
  );
};
