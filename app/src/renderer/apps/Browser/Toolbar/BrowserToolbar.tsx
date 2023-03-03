import {
  PointerEvent,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { TitlebarContainer } from 'renderer/system/desktop/components/AppWindow/Titlebar/Titlebar.styles';
import { Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { observer } from 'mobx-react';
import { ToolbarControlButtons } from './ToolbarControlButtons';
import { ToolbarSearchInput } from './ToolbarSearchInput';
import { ToolbarNavigationButtons } from './ToolbarNavigationButtons';
import { useBrowser } from '../store';
import { useDoubleClick } from 'renderer/logic/lib/useDoubleClick';

const ToolbarContainer = styled(TitlebarContainer)`
  padding: 0 10px;
  background: transparent;
  gap: 12px;
`;

export type BrowserToolbarProps = {
  zIndex: number;
  showDevToolsToggle: boolean;
  innerRef?: RefObject<HTMLDivElement>;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDragStart: (e: PointerEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
};

const BrowserToolbarPresenter = ({
  zIndex,
  showDevToolsToggle = true,
  innerRef,
  onDragEnd,
  onDragStart,
  onClose,
  onMinimize,
  onMaximize,
}: BrowserToolbarProps) => {
  const { currentTab } = useBrowser();
  const { theme } = useServices();
  const iconColor = useMemo(
    () => theme.currentTheme.iconColor,
    [theme.currentTheme.iconColor]
  );
  const onDoubleClick = useDoubleClick(onMaximize);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigationButtonsRef = useRef<HTMLInputElement>(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [readyWebview, setReadyWebview] = useState<Electron.WebviewTag>();

  useEffect(() => {
    const webview = document.getElementById(currentTab.id) as
      | Electron.WebviewTag
      | undefined;

    if (!webview) return;

    const onDomReady = () => setReadyWebview(webview);

    webview.addEventListener('dom-ready', onDomReady);

    return () => {
      webview.removeEventListener('dom-ready', onDomReady);
    };
  }, [currentTab.id]);

  useEffect(() => {
    if (!readyWebview) return;

    const onDidNavigate = () => {
      setCanGoBack(readyWebview.canGoBack());
      setCanGoForward(readyWebview.canGoForward());
    };

    readyWebview.addEventListener('did-navigate', onDidNavigate);
    readyWebview.addEventListener('did-navigate-in-page', onDidNavigate);

    return () => {
      readyWebview.removeEventListener('did-navigate', onDidNavigate);
      readyWebview.removeEventListener('did-navigate-in-page', onDidNavigate);
    };
  }, [readyWebview]);

  const isInInputField = (e: PointerEvent<HTMLDivElement>) =>
    e.target === inputRef.current ||
    inputRef.current?.contains(e.target as Node);

  const isInNavigationButtons = (e: PointerEvent<HTMLDivElement>) =>
    e.target === navigationButtonsRef.current ||
    navigationButtonsRef.current?.contains(e.target as Node);

  const onDoubleClickToolbar = (e: PointerEvent<HTMLDivElement>) => {
    if (!isInInputField(e) && !isInNavigationButtons(e)) onDoubleClick();
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!isInInputField(e)) onDragStart(e);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isInInputField(e)) onDragEnd();
  };

  const onBack = () => readyWebview?.goBack();

  const onForward = () => readyWebview?.goForward();

  const onRefresh = () => readyWebview?.reload();

  const toggleDevTools = () => {
    if (readyWebview)
      readyWebview.isDevToolsOpened()
        ? readyWebview.closeDevTools()
        : readyWebview.openDevTools();
  };

  return (
    <ToolbarContainer
      ref={innerRef}
      hasBorder
      hasBlur={false}
      zIndex={zIndex}
      onPointerUp={onPointerUp}
      onPointerDown={onPointerDown}
      onClick={onDoubleClickToolbar}
    >
      <Icons name="AppIconCompass" size="28px" />
      <ToolbarNavigationButtons
        innerRef={navigationButtonsRef}
        iconColor={iconColor}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={onBack}
        onForward={onForward}
        onRefresh={onRefresh}
      />
      <ToolbarSearchInput innerRef={inputRef} readyWebview={readyWebview} />
      <ToolbarControlButtons
        iconColor={iconColor}
        showDevToolsToggle={showDevToolsToggle}
        toggleDevTools={toggleDevTools}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
      />
    </ToolbarContainer>
  );
};

export const BrowserToolbar = observer(BrowserToolbarPresenter);
