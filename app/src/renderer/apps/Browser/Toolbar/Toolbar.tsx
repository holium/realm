import { PointerEvent, RefObject, useRef } from 'react';
import styled from 'styled-components';
import { TitlebarStyle } from 'renderer/system/desktop/components/AppWindow/Titlebar/Titlebar';
import { Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { observer } from 'mobx-react';
import { ToolbarControlButtons } from './ToolbarControlButtons';
import { ToolbarSearchInput } from './ToolbarSearchInput';
import { useDragControls } from 'framer-motion';
import { ToolbarNavigationButtons } from './ToolbarNavigationButtons';
import { useBrowser } from '../store';

const ToolbarStyle = styled(TitlebarStyle)`
  padding: 0 10px;
  background: transparent;
  gap: 12px;
`;

export interface BrowserToolbarProps {
  zIndex: number;
  windowColor: string;
  showDevToolsToggle: boolean;
  dragControls: ReturnType<typeof useDragControls>;
  innerRef?: RefObject<HTMLDivElement>;
  onDragStart: (e: PointerEvent<HTMLDivElement>) => void;
  onDragStop: (e: PointerEvent<HTMLDivElement>) => void;
  onClose: () => any;
  onMinimize: () => any;
  onMaximize: () => any;
}

export const BrowserToolbar = observer(
  ({
    zIndex,
    showDevToolsToggle = true,
    dragControls,
    innerRef,
    onDragStop,
    onDragStart,
    onClose,
    onMinimize,
    onMaximize,
  }: BrowserToolbarProps) => {
    const { currentTab } = useBrowser();
    const { theme } = useServices();
    const { iconColor } = theme.currentTheme;

    const inputRef = useRef<HTMLInputElement>(null);

    const getWebView = () =>
      document.getElementById(currentTab.id) as Electron.WebviewTag | null;

    const isInInputField = (e: PointerEvent<HTMLDivElement>) =>
      e.target === inputRef.current ||
      inputRef.current?.contains(e.target as Node);

    const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
      if (!isInInputField(e)) {
        dragControls.start(e);
        onDragStart(e);
      }
    };

    const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
      if (!isInInputField(e)) onDragStop(e);
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
      <ToolbarStyle
        ref={innerRef}
        hasBlur={false}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        zIndex={zIndex}
        hasBorder
      >
        <Icons name="AppIconCompass" size="28px" />
        <ToolbarNavigationButtons
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
      </ToolbarStyle>
    );
  }
);
