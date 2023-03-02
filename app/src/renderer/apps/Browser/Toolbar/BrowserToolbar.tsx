import { PointerEvent, RefObject, useRef } from 'react';
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
  const { iconColor } = theme.currentTheme;
  const onDoubleClick = useDoubleClick(onMaximize);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigationButtonsRef = useRef<HTMLInputElement>(null);

  const getWebView = () =>
    document.getElementById(currentTab.id) as Electron.WebviewTag | null;

  const isInInputField = (e: PointerEvent<HTMLDivElement>) =>
    e.target === inputRef.current ||
    inputRef.current?.contains(e.target as Node);

  const isInNavigationButtons = (e: PointerEvent<HTMLDivElement>) =>
    e.target === navigationButtonsRef.current ||
    navigationButtonsRef.current?.contains(e.target as Node);

  const onClickToolbar = (e: PointerEvent<HTMLDivElement>) => {
    if (!isInInputField(e) && !isInNavigationButtons(e)) onDoubleClick();
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!isInInputField(e)) onDragStart(e);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isInInputField(e)) onDragEnd();
  };

  const onBack = () => {
    const webView = getWebView();
    if (webView) webView.goBack();
  };

  const onForward = () => {
    const webView = getWebView();
    if (webView) webView.goForward();
  };

  const onRefresh = () => {
    const webView = getWebView();
    if (webView) webView.reload();
  };

  const toggleDevTools = () => {
    const webView = getWebView();
    if (webView)
      webView.isDevToolsOpened()
        ? webView.closeDevTools()
        : webView.openDevTools();
  };

  return (
    <ToolbarContainer
      ref={innerRef}
      hasBorder
      hasBlur={false}
      zIndex={zIndex}
      onPointerUp={onPointerUp}
      onPointerDown={onPointerDown}
      onClick={onClickToolbar}
    >
      <Icons name="AppIconCompass" size="28px" />
      <ToolbarNavigationButtons
        innerRef={navigationButtonsRef}
        iconColor={iconColor}
        canGoBack={getWebView()?.canGoBack() ?? false}
        canGoForward={getWebView()?.canGoForward() ?? false}
        onBack={onBack}
        onForward={onForward}
        onRefresh={onRefresh}
      />
      <ToolbarSearchInput innerRef={inputRef} />
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
