import { FC, useRef, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useMst, useShip } from '../../../../../../logic/store';

import { AppModelType } from '../../../../../../../core/ship/stores/docket';
import electron from 'electron';

interface AppViewProps {
  app: any;
}

const View = styled.div`
  width: inherit;
  height: inherit;
`;

export const AppView: FC<AppViewProps> = (props: AppViewProps) => {
  const { app } = props;
  const { ship } = useShip();
  const { desktopStore } = useMst();
  const elementRef = useRef(null);
  const webViewRef = useRef(null);
  const activeApp = desktopStore.activeApp;

  const [appConfig, setAppConfig] = useState<any>({
    url: null,
    cookies: { url: null, name: null, value: null },
  });
  const [dimensions, setDimensions] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const divElement: any = elementRef.current;
    const webviewEl: any = webViewRef.current;
    if (activeApp) {
      const config = divElement!.getBoundingClientRect();
      const formAppUrl = `${ship!.url}/apps/${activeApp!.id}`;
      const location = {
        url: formAppUrl,
        cookies: {
          url: formAppUrl,
          name: `urbauth-${ship!.patp}`,
          value: ship!.cookie!.split('=')[1].split('; ')[0],
        },
      };

      setAppConfig(location);

      desktopStore.openBrowserWindow(location, {
        x: config.x,
        // y: config.y + 42,
        y: config.y - 8,
        width: config.width,
        height: config.height,
        // height: config.height - 50,
      });
      setDimensions({
        x: config.x,
        // y: config.y + 42,
        y: config.y - 8,
        width: config.width,
        height: config.height,
        // height: config.height - 50,
      });
      // () => {
      //   desktopStore.closeBrowserWindow(location);
      // };
    }
  }, [activeApp && activeApp.id]);

  return (
    <View ref={elementRef}>
      {appConfig.url && (
        <webview
          ref={webViewRef}
          id={appConfig.url}
          partition="app-view"
          src={appConfig.url}
          style={dimensions}
        ></webview>
      )}
    </View>
  );
};
