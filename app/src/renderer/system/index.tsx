import {
  FC,
  useMemo,
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
} from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { ViewPort, Layer } from 'react-spaces';
import { useCore, useServices } from 'renderer/logic/store';
import { Auth } from './auth';
import { Desktop } from './desktop';
import {
  BackgroundImage,
  BackgroundFill,
  DimensionMeasurement,
  ResumingOverlay,
} from './system.styles';
import { AnimatePresence } from 'framer-motion';
import { DialogManager } from './dialog/DialogManager';
import { useWindowSize } from 'renderer/logic/lib/measure';
import { Flex, Spinner } from 'renderer/components';

const DragBar = styled.div`
  position: absolute;
  height: 22px;
  left: 0;
  top: 0;
  right: 0;
  --webkit-app-region: drag;
`;

export const Shell: FC = observer(() => {
  const { shell, desktop, identity, ship } = useServices();
  const { resuming } = useCore();
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
      <DimensionMeasurement id="dimensions" ref={windowRef} />
      <Layer zIndex={0}>{!isFullscreen && <DragBar />}</Layer>
      <Layer zIndex={2}>{DialogLayer}</Layer>
      <BgImage blurred={!shipLoaded || shell.isBlurred} wallpaper={bgImage} />
      <BackgroundFill hasWallpaper={hasWallpaper}>
        {resuming && (
          <ResumingOverlay>
            <Spinner size={2} />
          </ResumingOverlay>
        )}
        {!resuming && GUI}
        {/* {!resuming && shipLoaded && (
          <Desktop
            hasLoaded={shipLoaded}
            hasWallpaper={true}
            isFullscreen={isFullscreen}
          />
        )}
        {!resuming && !shipLoaded && (
          <Auth hasWallpaper={hasWallpaper} firstTime={firstTime} />
        )} */}
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
