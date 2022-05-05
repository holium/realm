import { FC, useRef, useEffect, useState, createRef } from 'react';
import styled, { css } from 'styled-components';
import { useMst, useShip } from '../../../../../../logic/store';

import { AppModelType } from '../../../../../../../core/ship/stores/docket';
import electron from 'electron';
import { Spinner, Flex } from '../../../../../../components';
import { useRefDimensions } from '../../../../../../logic/utils/useRefDimensions';

interface AppViewProps {
  app: any;
  hasTitlebar: boolean;
}
// height: ${(props: any) =>
//   props.hasTitleBar ? 'calc(100% - 50px)' : 'inherit'};
// height: ${(props: any) =>
//   props.hasTitleBar ? 'calc(100% - 30px)' : 'inherit'};
const View = styled.div<{ hasTitleBar?: boolean }>`
  width: inherit;
  height: inherit;
`;

export const AppView: FC<AppViewProps> = (props: AppViewProps) => {
  const { app } = props;
  const { ship } = useShip();
  const { desktopStore } = useMst();
  const elementRef = useRef(null);
  const webViewRef = useRef<any>(null);
  // const eldimensions = useRefDimensions(elementRef);
  // console.log(eldimensions);
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

  const [loading, setLoading] = useState(false);

  const onStartLoading = () => {
    setLoading(true);
  };

  const onStopLoading = () => {
    setLoading(false);
  };

  const handleResize = () => {
    const divElement: any = elementRef.current;
    if (divElement) {
      const config = divElement?.getBoundingClientRect();
      setDimensions({
        x: config.x,
        y: config.y - 8,
        width: config.width,
        height: config.height - 30,
      });
    }
  };

  useEffect(() => {
    const divElement: any = elementRef.current;
    const webviewEl: any = webViewRef.current;
    const webview = document.getElementById('app-webview');
    webview?.addEventListener('did-start-loading', onStartLoading);
    webview?.addEventListener('did-stop-loading', onStopLoading);
    window.addEventListener('resize', handleResize);
    // webview?.addEventListener('dom-ready', function () {
    //   webview?.openDevTools();
    // });

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
      const windowDimensions = {
        x: config.x,
        // y: config.y + 42,
        y: config.y - 8,
        width: config.width,
        height: config.height - 30,
        // height: config.height - 50,
      };

      desktopStore.openBrowserWindow(location, windowDimensions);
      setDimensions(windowDimensions);
      () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [activeApp && activeApp.id]);

  return (
    <View ref={elementRef}>
      {loading && (
        <Flex position="absolute" left="calc(50% - 4px)" top="calc(50% - 4px)">
          <Spinner size={1} />
        </Flex>
      )}
      <webview
        ref={webViewRef}
        id="app-webview"
        partition="app-view"
        src={appConfig.url}
        style={dimensions}
      ></webview>
    </View>
  );
};
