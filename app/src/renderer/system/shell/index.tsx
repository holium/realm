import { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { ViewPort, Top } from 'react-spaces';
import { AnimatePresence } from 'framer-motion';
import { useAuth, useMst, useShip } from '../../logic/store';
import { Auth } from './auth';
import { Desktop } from './desktop';
import {
  BackgroundDarken,
  BackgroundImage,
  BackgroundFill,
} from './Shell.styles';

type ShellProps = {
  isFullscreen: boolean;
};

export const Shell: FC<ShellProps> = observer((props: ShellProps) => {
  const { isFullscreen } = props;
  const { themeStore } = useMst();
  const { authStore } = useAuth();
  const { ship } = useShip();

  const wallpaper = themeStore.wallpaper;
  const bgImage = useMemo(() => wallpaper, [wallpaper]);

  const hasWallpaper = bgImage ? true : false;
  // const loggedIn = true; // shipStore.session?.loggedIn;

  const loggedIn = authStore.selected?.loggedIn && !authStore.isLoading;
  const shipLoaded = ship && ship.isLoaded;

  return (
    <ViewPort>
      <BgImage blurred={!loggedIn} wallpaper={bgImage} />
      <BackgroundFill hasWallpaper={hasWallpaper}>
        {!isFullscreen && (
          <Top
            size={30}
            // @ts-expect-error this error should be disabled
            style={{ WebkitAppRegion: 'drag', appRegion: 'drag' }}
          />
        )}
        {loggedIn ? (
          <Desktop
            hasLoaded={shipLoaded}
            hasWallpaper={true}
            isFullscreen={false}
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
    <BackgroundDarken hasWallpaper>
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
    </BackgroundDarken>
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
