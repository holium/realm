import { FC, useMemo } from 'react';
import { observer } from 'mobx-react';
import { ViewPort, Layer } from 'react-spaces';

import { useCore, useServices } from 'renderer/logic/store';
import { Auth } from './auth';
import { Desktop } from './desktop';
import {
  BackgroundImage,
  BackgroundFill,
  DragBar,
  ResumingOverlay,
} from './system.styles';
import { AnimatePresence } from 'framer-motion';
import { DialogManager } from './dialog/DialogManager';
import { Spinner, ConnectionStatus } from 'renderer/components';
import { ShellActions } from 'renderer/logic/actions/shell';
import { RealmActions } from 'renderer/logic/actions/main';

// Get the initial dimensions from the main process
RealmActions.onInitialDimensions((_e: any, dims: any) => {
  ShellActions.setDesktopDimensions(dims.width, dims.height);
});

export const Shell: FC = observer(() => {
  const { shell, theme, identity, ship } = useServices();
  const { resuming } = useCore();

  const isFullscreen = shell.isFullscreen;
  const wallpaper = theme.currentTheme.wallpaper;
  const firstTime = identity.auth.firstTime;
  const bgImage = useMemo(() => wallpaper, [wallpaper]);

  const hasWallpaper = !!bgImage;

  const DialogLayer = useMemo(
    () => (
      <DialogManager
        dialogId={shell.dialogId}
        dialogProps={shell.dialogProps}
      />
    ),
    [shell.dialogId, shell.dialogProps]
  );

  const shipLoaded = ship?.loader.isLoaded;

  const GUI = shipLoaded ? <Desktop /> : <Auth firstTime={firstTime} />;

  return (
    <ViewPort>
      <Layer zIndex={0}>{!isFullscreen && <DragBar />}</Layer>
      <Layer zIndex={2}>{DialogLayer}</Layer>
      <BgImage blurred={!shipLoaded || shell.isBlurred} wallpaper={bgImage} />
      <BackgroundFill hasWallpaper={hasWallpaper}>
        {resuming && (
          <ResumingOverlay>
            <Spinner color="#ffffff" size={4} />
          </ResumingOverlay>
        )}
        {!resuming && GUI}
      </BackgroundFill>
      <Layer zIndex={20}>
        <ConnectionStatus />
      </Layer>
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
            filter: blurred ? `blur(24px)` : 'blur(0px)',
          }}
          transition={{
            opacity: { duration: 0.5 },
          }}
        />
      </AnimatePresence>
    ),
    [blurred, wallpaper, nft]
  );
};
