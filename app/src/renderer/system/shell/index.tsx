import { FC, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { ViewPort, Top } from 'react-spaces';
import { average, prominent } from 'color.js';
import { AnimatePresence } from 'framer-motion';
import { useMst } from '../../logic/store';
import { Auth } from './auth';
import { Desktop } from './desktop';
import { detectTextTheme, bgIsLightOrDark } from '../../logic/utils/color';
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
  const { shipStore, spaceStore } = useMst();

  const bgImage = useMemo(
    () => shipStore.session?.wallpaper || 'https://source.unsplash.com/random',
    [shipStore.session?.wallpaper]
  );

  useEffect(() => {
    shipStore.getShips();
  }, []);

  useEffect(() => {
    average(bgImage, { group: 15, format: 'hex' }).then((color) => {
      // console.log(color);
      // if (!shipStore.session?.theme.backgroundColor) {
      let bgLuminosity = shipStore.session?.theme.textTheme;
      if (!bgLuminosity) {
        bgLuminosity = bgIsLightOrDark(color.toString());
      }
      // configStore
      shipStore.session?.setTheme({
        backgroundColor: color.toString(),
        textColor: 'text.primary',
        textTheme: bgLuminosity,
      });
      // }
    });
  }, [bgImage]);

  const hasWallpaper = bgImage ? true : false;
  // const loggedIn = true; // shipStore.session?.loggedIn;

  const loggedIn = shipStore.session?.loggedIn && !shipStore.isLoading;

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
          <Desktop hasWallpaper={hasWallpaper} isFullscreen={isFullscreen} />
        ) : (
          <Auth
            hasWallpaper={hasWallpaper}
            textTheme={shipStore.session?.theme.textTheme!}
          />
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
