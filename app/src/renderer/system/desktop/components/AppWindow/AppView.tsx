// import { FC, useRef, useEffect, useState, useMemo } from 'react';
// import styled from 'styled-components';
// import { useMst, useShip } from 'renderer/logic/store';
// import { Spinner, Flex } from 'renderer/components';
// import { WebTermCSS } from 'renderer/apps/WebTerm/WebTerm.styles';
// import { WindowModelType } from 'renderer/logic/desktop/store';
// import { toJS } from 'mobx';
// import { observer } from 'mobx-react';

// interface AppViewProps {
//   window: WindowModelType;
//   isResizing: boolean;
//   hasTitlebar: boolean;
// }

// const View = styled.div<{ hasTitleBar?: boolean }>`
//   transform: translateZ(0);
// `;

// export const AppView: FC<AppViewProps> = observer((props: AppViewProps) => {
//   const { isResizing, window } = props;
//   const { ship } = useShip();
//   const { desktop, theme } = useMst();
//   const elementRef = useRef(null);
//   const webViewRef = useRef<any>(null);

//   const window = window;

//   const [appConfig, setAppConfig] = useState<any>({
//     name: null,
//     url: null,
//     customCSS: WebTermCSS,
//     cookies: { url: null, name: null, value: null },
//   });

//   const [loading, setLoading] = useState(false);

//   const onStartLoading = () => {
//     setLoading(true);
//   };

//   const onStopLoading = () => {
//     setLoading(false);
//   };

//   useEffect(() => {
//     const webview: any = document.getElementById(
//       `${window.id}-urbit-webview`
//     );
//     webview?.addEventListener('did-start-loading', onStartLoading);
//     webview?.addEventListener('did-stop-loading', onStopLoading);

//     if (window && ship) {
//       webview?.addEventListener('did-finish-load', () => {
//         webview!.send('mouse-color', desktop.mouseColor);
//         let css = '* { cursor: none !important; }';
//         webview!.insertCSS(css);
//         // webview!.openDevTools();
//       });

//       webview?.addEventListener('close', () => {
//         // @ts-ignore
//         webview!.closeDevTools();
//       });
//       const location = desktop.openBrowserWindow(toJS(window));
//       setAppConfig(location);
//     }
//   }, [window?.id, ship]);

//   return useMemo(
//     () => (
//       <View
//         style={{
//           overflow: 'hidden',
//           width: 'inherit',
//           height: 'inherit',
//         }}
//         ref={elementRef}
//       >
//         {loading && (
//           <Flex
//             position="absolute"
//             left="calc(50% - 4px)"
//             top="calc(50% - 4px)"
//           >
//             <Spinner size={1} />
//           </Flex>
//         )}
//         <webview
//           ref={webViewRef}
//           id={`${window.id}-urbit-webview`}
//           partition="urbit-webview"
//           preload={`file://${desktop.appviewPreload}`}
//           src={appConfig.url}
//           onMouseEnter={() => desktop.setIsMouseInWebview(true)}
//           onMouseLeave={() => desktop.setIsMouseInWebview(false)}
//           style={{
//             width: 'inherit',
//             height: '100%',
//             position: 'relative',
//             pointerEvents: isResizing || loading ? 'none' : 'auto',
//           }}
//         />
//       </View>
//     ),
//     [loading, window.id, appConfig.url, isResizing]
//   );
// });

import { FC, useRef, useCallback, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { Spinner, Flex } from 'renderer/components';
import { WindowModelType } from 'renderer/logic-old/desktop/store';
import { toJS } from 'mobx';
import { clone } from 'mobx-state-tree';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store-2';

interface AppViewProps {
  window: WindowModelType;
  isResizing: boolean;
  isDragging: boolean;
  hasTitlebar: boolean;
}

const View = styled.div<{ hasTitleBar?: boolean }>`
  transform: translateZ(0);
`;

export const AppView: FC<AppViewProps> = observer((props: AppViewProps) => {
  const { isResizing, isDragging, window } = props;
  const { ship, shell } = useServices();
  const { desktop, theme } = shell;
  const elementRef = useRef(null);
  const webViewRef = useRef<any>(null);

  const [appConfig, setAppConfig] = useState<any>({
    name: null,
    url: null,
  });

  const isActive = desktop.isActiveWindow(window.id);

  const [loading, setLoading] = useState(false);

  const onStartLoading = () => {
    setLoading(true);
  };

  const onStopLoading = () => {
    setLoading(false);
  };

  const lockView = useMemo(
    () => isResizing || isDragging || loading || !isActive,
    [isResizing, isDragging, loading, isActive]
  );

  useEffect(() => {
    const webview: any = document.getElementById(`${window.id}-urbit-webview`);
    webview?.addEventListener('did-start-loading', onStartLoading);
    webview?.addEventListener('did-stop-loading', onStopLoading);

    if (window && ship) {
      webview?.addEventListener('did-finish-load', () => {
        webview!.send('mouse-color', desktop.mouseColor);
        let css = '* { cursor: none !important; }';
        webview!.insertCSS(css);
      });

      webview?.addEventListener('close', () => {
        // @ts-ignore
        webview!.closeDevTools();
      });
      let appUrl = `${ship!.url}/apps/${window.id!}`;
      desktop.openBrowserWindow(clone(window));
      setAppConfig({ url: appUrl });
    }
  }, [window?.id, ship]);

  const onMouseEnter = useCallback(() => {
    desktop.setIsMouseInWebview(true);
  }, [desktop]);
  const onMouseLeave = useCallback(() => {
    desktop.setIsMouseInWebview(false);
  }, [desktop]);

  return useMemo(() => {
    // console.log('render app window');
    return (
      <View
        style={{
          overflow: 'hidden',
          width: 'inherit',
          height: 'inherit',
        }}
        ref={elementRef}
      >
        {loading && (
          <Flex
            position="absolute"
            left="calc(50% - 4px)"
            top="calc(50% - 4px)"
          >
            <Spinner size={1} />
          </Flex>
        )}
        <webview
          ref={webViewRef}
          id={`${window.id}-urbit-webview`}
          partition="urbit-webview"
          preload={`file://${desktop.appviewPreload}`}
          src={appConfig.url}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={{
            width: 'inherit',
            height: '100%',
            position: 'relative',
            pointerEvents: lockView ? 'none' : 'auto',
          }}
        />
      </View>
    );
  }, [lockView, window.id, appConfig.url]);
});
