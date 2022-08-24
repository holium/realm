import {
  FC,
  useMemo,
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  Ref,
  RefObject,
} from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { ViewPort, Layer } from 'react-spaces';
import { coreStore, useServices } from 'renderer/logic/store';
import { Auth } from './auth';
import { Desktop } from './desktop';
import {
  BackgroundImage,
  BackgroundFill,
  DimensionMeasurement,
  DragBar,
} from './system.styles';
import { AnimatePresence } from 'framer-motion';
import { DialogManager } from './dialog/DialogManager';
import { useWindowSize } from '../logic/lib/measure';

export const Shell: FC = observer(() => {
  const { shell, desktop, identity, ship } = useServices();
  const windowRef = useRef(null);
  useWindowSize(windowRef);

  const isFullscreen = shell.isFullscreen;
  const wallpaper = desktop.theme.wallpaper;
  const firstTime = identity.auth.firstTime;
  const bgImage = useMemo(() => wallpaper, [wallpaper]);

  const hasWallpaper = bgImage ? true : false;

  const DialogLayer = useMemo(
    () => <DialogManager dialogId={shell.dialogId} />,
    [shell.dialogId]
  );

  const shipLoaded = ship?.loader.isLoaded;
  const isResuming = coreStore.resuming;
  return (
    <ViewPort>
      <DimensionMeasurement id="dimensions" ref={windowRef} />
      <Layer zIndex={0}>{!isFullscreen && <DragBar />}</Layer>
      <Layer zIndex={2}>{DialogLayer}</Layer>
      <BgImage blurred={!shipLoaded || shell.isBlurred} wallpaper={bgImage} />
      <BackgroundFill hasWallpaper={hasWallpaper}>
        {shipLoaded && (
          <Desktop
            hasLoaded={shipLoaded}
            hasWallpaper={true}
            isFullscreen={isFullscreen}
          />
        )}
        {!shipLoaded && !isResuming && (
          <Auth hasWallpaper={hasWallpaper} firstTime={firstTime} />
        )}
        {!shipLoaded && isResuming && <div></div>}
      </BackgroundFill>
    </ViewPort>
  );
});

export default Shell;

const BgImage = ({
  blurred,
  wallpaper,
  nft,
}: {
  blurred: boolean;
  wallpaper: string;
  nft?: {
    creator: string;
    blockchain: string;
    contract: string;
    tokenStandard: string;
    tokenId: string;
  };
}) => {
  const [imageLoading, setImageLoading] = useState(true);

  const imageLoaded = () => {
    setImageLoading(false);
  };

  return useMemo(
    () => (
      <AnimatePresence>
        <BackgroundImage
          key={wallpaper}
          src={wallpaper}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          onLoad={imageLoaded}
          animate={{
            opacity: 1,
            filter: blurred ? `blur(24px)` : 'blur(0px)',
            // transition:
          }}
          transition={{
            opacity: { duration: 0.5 },
          }}
        />
      </AnimatePresence>
    ),
    [blurred, wallpaper, imageLoading, nft]
  );
};
