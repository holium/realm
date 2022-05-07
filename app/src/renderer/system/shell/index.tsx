import React, { FC, useRef, useMemo, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { ViewPort, Top, Fill, Layer } from 'react-spaces';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth, useMst, useShip } from '../../logic/store';
import { Mouse } from './desktop/components/Mouse';
import { Auth } from './auth';
import { Desktop } from './desktop';
import {
  BackgroundImage,
  BackgroundFill,
  BackgroundDarken,
} from './Shell.styles';

type ShellProps = {};

const DragBar = styled.div`
  position: absolute;
  height: 22px;
  left: 0;
  top: 0;
  right: 0;
  --webkit-app-region: drag;
  app-region: drag;
  &:active {
    cursor: grabbing;
  }
`;

export const Shell: FC<ShellProps> = observer((props: ShellProps) => {
  const { themeStore, desktopStore } = useMst();
  const { authStore } = useAuth();
  const { ship } = useShip();

  const isFullscreen = desktopStore.isFullscreen;
  const wallpaper = themeStore.wallpaper;
  const bgImage = useMemo(() => wallpaper, [wallpaper]);

  const hasWallpaper = bgImage ? true : false;
  // const loggedIn = true; // shipStore.session?.loggedIn;

  const loggedIn = authStore.selected?.loggedIn && !authStore.isLoading;
  const shipLoaded = ship && ship.isLoaded;
  console.log('rerendering shell');
  return (
    <ViewPort>
      {/* <Mouse /> */}
      <Layer zIndex={0}>{!isFullscreen && <DragBar />}</Layer>
      <BgImage blurred={!loggedIn} wallpaper={bgImage} />
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
  const [imageLoading, setImageLoading] = useState(true);

  const imageLoaded = () => {
    setImageLoading(false);
  };
  return (
    // <BackgroundDarken hasWallpaper>
    <AnimatePresence>
      <BackgroundImage
        key={wallpaper}
        src={wallpaper}
        // width="auto"
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        animate={{
          opacity: imageLoading ? 0 : 1,
          filter: blurred ? 'blur(20px)' : 'blur(0px)',
        }}
        transition={{
          opacity: { duration: 1 },
          blur: { duration: 2, ease: true },
        }}
        onLoad={imageLoaded}
      />
    </AnimatePresence>
    // </BackgroundDarken>
  );
};

// const ShipDesktop = observer(() => {
//   const { ship } = useShip();
//   useEffect(() => {
//     // ship.ini
//   }, []);
//   console.log('ship', ship);
//   return (
//     <ShipProvider value={shipState}>
//       {ship && ship.isLoaded ? (
//         <Desktop hasWallpaper={true} isFullscreen={false} />
//       ) : (
//         <Splash />
//       )}
//     </ShipProvider>
//   );
// });
