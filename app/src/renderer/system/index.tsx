import { FC, useMemo, useState, useLayoutEffect, useEffect } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { ViewPort, Layer } from 'react-spaces';
import { useServices } from 'renderer/logic/store';
import { Auth } from './auth';
import { Desktop } from './desktop';
import { ShellActions } from 'renderer/logic/actions/shell';
import { BackgroundImage, BackgroundFill } from './system.styles';
import { AnimatePresence } from 'framer-motion';
import { DialogManager } from './dialog/DialogManager';
import { SoundActions } from '../logic/actions/sound';

const DragBar = styled.div`
  position: absolute;
  height: 22px;
  left: 0;
  top: 0;
  right: 0;
  --webkit-app-region: drag;
`;

function useWindowSize() {
  useLayoutEffect(() => {
    function updateSize() {
      ShellActions.setDesktopDimensions(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
}

export const Shell: FC = observer(() => {
  const { shell, desktop, identity, ship } = useServices();
  useWindowSize();

  const isFullscreen = shell.isFullscreen;
  const wallpaper = desktop.theme.wallpaper;
  const firstTime = identity.auth.firstTime;
  const bgImage = useMemo(() => wallpaper, [wallpaper]);

  const hasWallpaper = bgImage ? true : false;

  const DialogLayer = useMemo(
    () => <DialogManager dialogId={shell.dialogId} />,
    [shell.dialogId]
  );

  // useEffect(() => {
  //   if (ship?.loader.isLoaded) {
  //     SoundActions.playStartup();
  //   } else {
  //     SoundActions.playLogout();
  //   }
  // }, [ship?.loader.isLoaded]);

  const shipLoaded = ship?.loader.isLoaded;
  return (
    <ViewPort>
      <Layer zIndex={0}>{!isFullscreen && <DragBar />}</Layer>
      <Layer zIndex={2}>{DialogLayer}</Layer>
      <BgImage blurred={!shipLoaded || shell.isBlurred} wallpaper={bgImage} />
      <BackgroundFill hasWallpaper={hasWallpaper}>
        {shipLoaded ? (
          <Desktop
            hasLoaded={shipLoaded}
            hasWallpaper={true}
            isFullscreen={isFullscreen}
          />
        ) : (
          <Auth hasWallpaper={hasWallpaper} firstTime={firstTime} />
        )}
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
