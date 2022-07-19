import { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { ViewPort, Layer } from 'react-spaces';
// import { useAuth, useMst, useShip } from 'renderer/logic/store';
import { coreStore, useCore, useServices } from 'renderer/logic/store';
import { Auth } from './auth';
import { Desktop } from './desktop';
import { BackgroundImage, BackgroundFill } from './system.styles';
import { AnimatePresence } from 'framer-motion';
import { Flex, NFTBadge } from 'renderer/components';

const DragBar = styled.div`
  position: absolute;
  height: 22px;
  left: 0;
  top: 0;
  right: 0;
  --webkit-app-region: drag;
  app-region: drag;
`;

export const Shell: FC = observer(() => {
  const { loggedIn } = useCore();

  const { shell, identity, ship } = useServices();
  const { desktop } = shell;

  const isFullscreen = desktop.isFullscreen;
  const wallpaper = desktop.theme.wallpaper;
  const bgImage = useMemo(() => wallpaper, [wallpaper]);
  // const { backgroundColor, mode } = shell.desktop.theme;

  const hasWallpaper = bgImage ? true : false;
  const isBlurred = useMemo(
    () => !loggedIn || desktop.isBlurred,
    [desktop.isBlurred, loggedIn]
  );

  const shipLoaded = ship?.loader.isLoaded;
  let nft = undefined;
  if (ship?.patp === '~labruc-dillyx-lomder-librun') {
    nft = {
      creator: '~lomder-librun',
      blockchain: 'ethereum',
      contract: '0x513c...77a2',
      tokenStandard: 'ERC-721',
      tokenId: '191',
    };
  }
  return (
    <ViewPort>
      <Layer zIndex={0}>{!isFullscreen && <DragBar />}</Layer>
      <BgImage blurred wallpaper={bgImage} />
      {/* <BgImage blurred={isBlurred} wallpaper={bgImage} /> */}

      {/* {nft && (
        <Layer zIndex={2}>
          <Flex position="absolute" top={16} right={16}>
            <NFTBadge mode={mode} color={backgroundColor} />
          </Flex>
        </Layer>
      )} */}
      <BackgroundFill hasWallpaper={hasWallpaper}>
        {shipLoaded ? (
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
            filter: blurred ? 'blur(24px)' : 'blur(0px)',
          }}
          transition={{
            opacity: { duration: 1 },
          }}
        />
      </AnimatePresence>
    ),
    [blurred, wallpaper, imageLoading, nft]
  );
};
