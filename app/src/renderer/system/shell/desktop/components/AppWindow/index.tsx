import { FC } from 'react';
import { ViewPort, Bottom, Layer, Fill, Top } from 'react-spaces';

type AppWindowProps = {
  isFullscreen: boolean;
};

export const AppWindow: FC<AppWindowProps> = (props: AppWindowProps) => {
  const { isFullscreen } = props;
  return (
    <div></div>
    // <ViewPort>
    //   {!isFullscreen && (
    //     <Top
    //       size={30}
    //       // @ts-expect-error this error should be disabled
    //       style={{ WebkitAppRegion: 'drag', appRegion: 'drag' }}
    //     />
    //   )}
    //   <Fill>Holium Realm</Fill>
    //   <Layer zIndex={1}>
    //     <Bottom size={40}>{/* <SystemBar /> */}</Bottom>
    //   </Layer>
    // </ViewPort>
  );
};

export default AppWindow;
