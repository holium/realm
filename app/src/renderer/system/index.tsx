import { FC, useMemo, useState, useRef } from 'react';
import { observer } from 'mobx-react';
import { ViewPort, Layer } from 'react-spaces';

import { useCore, useServices } from 'renderer/logic/store';
import { Auth } from './auth';
import { Desktop } from './desktop';
import {
  BackgroundImage,
  BackgroundFill,
  DimensionMeasurement,
  DragBar,
  ResumingOverlay,
} from './system.styles';
import { AnimatePresence } from 'framer-motion';
import { DialogManager } from './dialog/DialogManager';
import { useWindowSize } from 'renderer/logic/lib/measure';
import { Flex, Spinner } from 'renderer/components';
import { ShellActions } from 'renderer/logic/actions/shell';
import { RealmActions } from 'renderer/logic/actions/main';

// Get the initial dimensions from the main process
RealmActions.onInitialDimensions((_e: any, dims: any) => {
  ShellActions.setDesktopDimensions(dims.width, dims.height);
});

export const Shell: FC = observer(() => {
  const { shell, desktop, theme, identity, ship } = useServices();
  const { resuming } = useCore();
  // const windowRef = useRef(null);
  // useWindowSize(windowRef);

  const isFullscreen = shell.isFullscreen;
  const wallpaper = theme.currentTheme.wallpaper;
  const firstTime = identity.auth.firstTime;
  const bgImage = useMemo(() => wallpaper, [wallpaper]);

  const hasWallpaper = bgImage ? true : false;

  const DialogLayer = useMemo(
    () => <DialogManager dialogId={shell.dialogId} />,
    [shell.dialogId]
  );

  const shipLoaded = ship?.loader.isLoaded;

  const GUI = shipLoaded ? (
    <Desktop
      hasLoaded={shipLoaded}
      hasWallpaper={true}
      isFullscreen={isFullscreen}
    />
  ) : (
    <Auth hasWallpaper={hasWallpaper} firstTime={firstTime} />
  );
  return (
    <ViewPort>
      <Layer zIndex={0}>{!isFullscreen && <DragBar />}</Layer>
      <Layer zIndex={2}>{DialogLayer}</Layer>
      <BgImage blurred={!shipLoaded || shell.isBlurred} wallpaper={bgImage} />
      <BackgroundFill hasWallpaper={hasWallpaper}>
        {/* <DimensionMeasurement id="dimensions" ref={windowRef} /> */}
        {resuming && (
          <ResumingOverlay>
            <Spinner color="#ffffff" size={4} />
          </ResumingOverlay>
        )}
        {!resuming && GUI}
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
