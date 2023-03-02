import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { ViewPort, Layer } from 'react-spaces';

import { useCore, useServices } from 'renderer/logic/store';
import { Auth } from './auth';
import { Desktop } from './desktop/Desktop';
import {
  BackgroundImage,
  BackgroundFill,
  DragBar,
  ResumingOverlay,
} from './system.styles';
import { AnimatePresence } from 'framer-motion';
import { DialogManager } from './dialog/DialogManager';
import { Spinner } from '@holium/design-system';
import { ConnectionStatus } from 'renderer/components';
import { ShellActions } from 'renderer/logic/actions/shell';
import { RealmActions } from 'renderer/logic/actions/main';
import { DesktopActions } from 'renderer/logic/actions/desktop';

// Get the initial dimensions from the main process
RealmActions.onInitialDimensions((_e: any, dims: any) => {
  ShellActions.setDesktopDimensions(dims.width, dims.height);
});

const ShellPresenter = () => {
  const { shell, theme, identity, ship, desktop } = useServices();
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

  useEffect(() => {
    // Sync Electron with MobX state.
    if (desktop.isIsolationMode) {
      DesktopActions.enableIsolationMode();
    } else {
      DesktopActions.disableIsolationMode();
    }
  }, [desktop.isIsolationMode]);

  return (
    <ViewPort>
      <Layer zIndex={0}>{!isFullscreen && <DragBar />}</Layer>
      <Layer zIndex={2}>{DialogLayer}</Layer>
      <BgImage blurred={!shipLoaded || shell.isBlurred} wallpaper={bgImage} />
      <BackgroundFill hasWallpaper={hasWallpaper}>
        {resuming && (
          <ResumingOverlay>
            <Spinner size={4} color="#FFF" />
          </ResumingOverlay>
        )}
        {!resuming && GUI}
      </BackgroundFill>
      <Layer zIndex={20}>
        <ConnectionStatus />
      </Layer>
    </ViewPort>
  );
};

export const Shell = observer(ShellPresenter);

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
